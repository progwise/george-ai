import { exec } from 'child_process'

export interface smbClientOptions {
  username: string
  password: string
}

export interface SMBFileInfo {
  name: string
  size: number
  isDirectory: boolean
  modifiedTime: Date
}

class SMBClient {
  private options: smbClientOptions

  constructor(options: smbClientOptions) {
    this.options = options
  }

  private parseUri(uri: string): { server: string; share: string; path: string } {
    const match = uri.match(/^smb:\/\/([^/]+)\/([^/]+)(.*)$/)
    if (!match) {
      throw new Error(`Invalid SMB URI: ${uri}`)
    }

    const [, server, share, path] = match
    // For internal container networking, use just the hostname without port
    const serverName = server.includes(':') ? server.split(':')[0] : server

    if (!serverName) {
      throw new Error(`Invalid SMB URI: server name is required in ${uri}`)
    }

    // Decode the path to handle URI-encoded spaces and special characters
    const decodedPath = path ? decodeURIComponent(path) : '/'

    return {
      server: serverName,
      share,
      path: decodedPath,
    }
  }

  private executeSmbCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        SMBCLIENT_PASSWORD: this.options.password,
      }

      exec(command, { env }, (error, stdout, stderr) => {
        // If we have an error but also have useful stdout, we might still be able to proceed
        if (error) {
          // Check if this is a known recoverable error with useful output
          const errorMessage = error.message
          const hasUsefulOutput = stdout && stdout.trim().length > 0
          const isRecoverableError = 
            stderr?.includes('is_bad_finfo_name') ||
            errorMessage.includes('NT_STATUS_INVALID_NETWORK_RESPONSE') ||
            stderr?.includes('NT_STATUS_INVALID_NETWORK_RESPONSE')
          
          if (hasUsefulOutput && isRecoverableError) {
            // Log the error but continue with the output we got
            console.warn(`SMB command completed with warning: ${errorMessage}`)
            resolve(stdout)
            return
          }
          
          reject(new Error(`SMB command execution failed: ${error.message}`))
          return
        }

        if (
          stderr &&
          !stderr.includes('WARNING') &&
          !stderr.includes('NOTE') &&
          !stderr.includes('getting file') &&
          !stderr.includes('KiloBytes/sec') &&
          !stderr.includes('is_bad_finfo_name') &&
          !stderr.includes('NT_STATUS_INVALID_NETWORK_RESPONSE')
        ) {
          reject(new Error(`SMB command failed: ${stderr}`))
          return
        }

        resolve(stdout)
      })
    })
  }

  private parseSmbOutput(output: string): SMBFileInfo[] {
    const lines = output.split('\n')
    const files: SMBFileInfo[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.includes('blocks available')) {
        continue
      }

      // SMB output uses fixed column positions. The file type (D/A/N) appears to be around column 36-40
      // Look for D/A/N in that region, then work backwards to find the filename
      let name = ''
      let type = ''
      let sizeStr = ''
      let dateStr = ''
      
      // Find D/A/N followed by whitespace and digits
      const typePatternMatch = trimmed.match(/\s([ADN])\s+(\d+)\s+(.+)$/)
      if (typePatternMatch) {
        const typeIndex = trimmed.indexOf(typePatternMatch[0])
        name = trimmed.substring(0, typeIndex).trim()
        type = typePatternMatch[1]
        sizeStr = typePatternMatch[2]
        dateStr = typePatternMatch[3]
        
        // Skip . and .. directories
        if (name === '.' || name === '..') {
          continue
        }
        
        const isDirectory = type === 'D'
        const size = parseInt(sizeStr) || 0

        let modifiedTime: Date
        try {
          modifiedTime = new Date(dateStr)
        } catch {
          modifiedTime = new Date()
        }

        files.push({
          name,
          size,
          isDirectory,
          modifiedTime,
        })
      }
    }

    return files
  }

  async listFiles(uri: string): Promise<SMBFileInfo[]> {
    const { server, share, path } = this.parseUri(uri)
    let lsPath = path === '/' ? '' : path.startsWith('/') ? path.substring(1) : path
    lsPath = lsPath.endsWith('/') ? lsPath.slice(0, -1) : lsPath
    
    let command: string
    if (lsPath === '') {
      // For root directory, use ls without any path
      command = `smbclient //${server}/${share} -U "${this.options.username}%${this.options.password}" -c 'ls'`
    } else {
      // For subdirectories, use /* to list contents instead of the directory itself
      const escapedPath = lsPath.replace(/'/g, "'\\''")
      command = `smbclient //${server}/${share} -U "${this.options.username}%${this.options.password}" -c 'ls "${escapedPath}/*"'`
    }

    const output = await this.executeSmbCommand(command)
    return this.parseSmbOutput(output).filter((file) => !file.isDirectory)
  }

  async listDirectories(uri: string): Promise<SMBFileInfo[]> {
    const { server, share, path } = this.parseUri(uri)
    let lsPath = path === '/' ? '' : path.startsWith('/') ? path.substring(1) : path
    lsPath = lsPath.endsWith('/') ? lsPath.slice(0, -1) : lsPath
    
    let command: string
    if (lsPath === '') {
      // For root directory, use ls without any path
      command = `smbclient //${server}/${share} -U "${this.options.username}%${this.options.password}" -c 'ls'`
    } else {
      // For subdirectories, use /* to list contents instead of the directory itself
      const escapedPath = lsPath.replace(/'/g, "'\\''")
      command = `smbclient //${server}/${share} -U "${this.options.username}%${this.options.password}" -c 'ls "${escapedPath}/*"'`
    }

    const output = await this.executeSmbCommand(command)
    return this.parseSmbOutput(output).filter((file) => file.isDirectory)
  }

  async readFile(uri: string): Promise<string> {
    const { server, share, path } = this.parseUri(uri)
    const filePath = path.startsWith('/') ? path.substring(1) : path
    const escapedPath = filePath.replace(/'/g, "'\\''")
    const command = `smbclient //${server}/${share} -U "${this.options.username}%${this.options.password}" -c 'get "${escapedPath}" -'`
    
    return await this.executeSmbCommand(command)
  }
}

let defaultClient: SMBClient | null = null

export const configure = (options: smbClientOptions) => {
  if (!options.username || !options.password) {
    defaultClient = null
    return
  }
  defaultClient = new SMBClient(options)
}

export const listFiles = async (uri: string, options?: smbClientOptions): Promise<SMBFileInfo[]> => {
  const client = options ? new SMBClient(options) : defaultClient
  if (!client) {
    throw new Error('SMB client not configured')
  }
  return client.listFiles(uri)
}

export const readFile = async (uri: string, options?: smbClientOptions): Promise<string> => {
  const client = options ? new SMBClient(options) : defaultClient
  if (!client) {
    throw new Error('SMB client not configured')
  }
  return client.readFile(uri)
}

export const listDirectories = async (uri: string, options?: smbClientOptions): Promise<SMBFileInfo[]> => {
  const client = options ? new SMBClient(options) : defaultClient
  if (!client) {
    throw new Error('SMB client not configured')
  }
  return client.listDirectories(uri)
}

export { SMBClient }
