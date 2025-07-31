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

    return {
      server: serverName,
      share,
      path: path || '/',
    }
  }

  private executeSmbCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        SMBCLIENT_PASSWORD: this.options.password,
      }

      exec(command, { env }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`SMB command execution failed: ${error.message}`))
          return
        }

        if (
          stderr &&
          !stderr.includes('WARNING') &&
          !stderr.includes('NOTE') &&
          !stderr.includes('getting file') &&
          !stderr.includes('KiloBytes/sec')
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
      if (!trimmed || trimmed.startsWith('.') || trimmed.includes('blocks available')) {
        continue
      }

      const parts = trimmed.split(/\s+/)
      if (parts.length >= 4) {
        const name = parts[0]
        const isDirectory = parts[1] === 'D'
        const size = parseInt(parts[2]) || 0

        const dateStr = parts.slice(3, 6).join(' ')
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
    const command = `smbclient //${server}/${share} -U "${this.options.username}%${this.options.password}" -c "ls ${lsPath}"`

    const output = await this.executeSmbCommand(command)
    return this.parseSmbOutput(output).filter((file) => !file.isDirectory)
  }

  async listDirectories(uri: string): Promise<SMBFileInfo[]> {
    const { server, share, path } = this.parseUri(uri)
    let lsPath = path === '/' ? '' : path.startsWith('/') ? path.substring(1) : path
    lsPath = lsPath.endsWith('/') ? lsPath.slice(0, -1) : lsPath
    const command = `smbclient //${server}/${share} -U "${this.options.username}%${this.options.password}" -c "ls ${lsPath}"`

    const output = await this.executeSmbCommand(command)
    return this.parseSmbOutput(output).filter((file) => file.isDirectory)
  }

  async readFile(uri: string): Promise<string> {
    const { server, share, path } = this.parseUri(uri)
    const filePath = path.startsWith('/') ? path.substring(1) : path
    const command = `smbclient //${server}/${share} -U "${this.options.username}%${this.options.password}" -c "get ${filePath} -"`

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
