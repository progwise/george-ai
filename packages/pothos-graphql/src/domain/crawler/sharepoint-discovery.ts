export interface SharePointList {
  id: string
  title: string
  baseTemplate: number
  baseTemplateDescription: string
  itemCount: number
  hidden: boolean
  description: string
  defaultViewUrl: string
  webTemplate?: string
}

export interface SharePointSiteInfo {
  title: string
  url: string
  serverRelativeUrl: string
  description: string
  webTemplate: string
}

export interface SharePointDiscoveryResult {
  siteInfo: SharePointSiteInfo | null
  lists: SharePointList[]
  documentLibraries: SharePointList[]
}

/**
 * Discovers available lists and document libraries on a SharePoint site
 */
export async function discoverSharePointSiteContent(
  apiUrl: URL,
  authCookies: string,
): Promise<SharePointDiscoveryResult> {
  const siteInfo = await getSharepointSiteInfo(apiUrl, authCookies)
  const { lists, documentLibraries } = await getSharepointListsInfo(apiUrl, authCookies)

  return { siteInfo, lists, documentLibraries }
}

/**
 * Gets the base template descriptions for SharePoint lists
 */
export function getSharePointListTypeDescription(baseTemplate: number): string {
  const templateDescriptions: Record<number, string> = {
    100: 'Generic List',
    101: 'Document Library',
    102: 'Survey',
    103: 'Links List',
    104: 'Announcements List',
    105: 'Contacts List',
    106: 'Events List',
    107: 'Tasks List',
    108: 'Discussion Board',
    109: 'Picture Library',
    110: 'Data Sources',
    111: 'Site Template Gallery',
    112: 'User Information List',
    113: 'Web Part Gallery',
    114: 'List Template Gallery',
    115: 'XML Form Library',
    116: 'Master Page Gallery',
    117: 'No-Code Workflows',
    118: 'Custom Workflow Process',
    119: 'Wiki Page Library',
    120: 'Custom Grid',
    121: 'Solutions Gallery',
    122: 'No-Code Public Workflow',
    123: 'Text Box',
    130: 'Data Connection Library',
    140: 'Workflow History',
    150: 'Gantt Tasks List',
    200: 'Meeting Series',
    201: 'Meeting Agenda',
    202: 'Meeting Attendees',
    204: 'Meeting Decisions',
    207: 'Meeting Objectives',
    210: 'Meeting Text Box',
    211: 'Meeting Things To Bring',
    212: 'Meeting Workspace Pages',
    301: 'Blog Posts',
    302: 'Blog Comments',
    303: 'Blog Categories',
    851: 'Asset Library',
  }

  return templateDescriptions[baseTemplate] || `Unknown (${baseTemplate})`
}

const getSharepointSiteInfo = async (apiUrl: URL, authCookies: string): Promise<SharePointSiteInfo> => {
  // Common headers for all requests
  const headers = {
    Accept: 'application/json;odata=verbose',
    Cookie: authCookies,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }

  // Get site information using the working API endpoint
  const webInfoUrl = `${apiUrl}/web?$select=Title,Url,ServerRelativeUrl,Description,WebTemplate`

  const webInfoResponse = await fetch(webInfoUrl, {
    method: 'GET',
    headers,
  })

  const webInfoText = await webInfoResponse.text()

  if (!webInfoResponse.ok) {
    throw new Error(
      `Failed to access SharePoint site on ${webInfoUrl}: ${webInfoResponse.status} ${webInfoResponse.statusText}\n${webInfoText}`,
    )
  }

  if (webInfoText.trim().startsWith('<')) {
    throw new Error(
      `Accessing SharePoint site on ${webInfoUrl} received HTML instead of JSON - Authentication Failure: ${webInfoResponse.status} ${webInfoResponse.statusText}\n${webInfoText}`,
    )
  }

  const webInfo = JSON.parse(webInfoText)
  return {
    title: webInfo.d?.Title || 'Unknown',
    url: webInfo.d?.Url || apiUrl,
    serverRelativeUrl: webInfo.d?.ServerRelativeUrl || '/',
    description: webInfo.d?.Description || '',
    webTemplate: webInfo.d?.WebTemplate || 'Unknown',
  }
}

const getSharepointListsInfo = async (
  apiUrl: URL,
  authCookies: string,
): Promise<{ lists: SharePointList[]; documentLibraries: SharePointList[] }> => {
  const headers = {
    Accept: 'application/json;odata=verbose',
    Cookie: authCookies,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }

  const listsUrl = `${apiUrl}/web/lists?$select=Id,Title,BaseTemplate,ItemCount,Hidden,Description,DefaultViewUrl&$orderby=Title`

  const listsResponse = await fetch(listsUrl, {
    method: 'GET',
    headers,
  })

  const listsText = await listsResponse.text()
  if (!listsResponse.ok) {
    if (listsResponse.status === 401 || listsResponse.status === 403) {
      throw new Error(
        `Authentication for getting sharepoint lists info on ${listsUrl} failed. Please refresh your SharePoint cookies.`,
      )
    } else if (listsResponse.status === 404) {
      throw new Error(
        `SharePoint site not found. Please check the URL ${listsUrl} failed. Please refresh your SharePoint cookies.`,
      )
    } else {
      throw new Error(
        `Failed to access SharePoint lists on ${listsUrl}: ${listsResponse.status} ${listsResponse.statusText}`,
      )
    }
  }

  if (listsText.trim().startsWith('<')) {
    throw new Error(
      `Accessing SharePoint site on ${listsUrl} received HTML instead of JSON - Authentication Failure: ${listsResponse.status} ${listsResponse.statusText}\n${listsResponse}`,
    )
  }

  const listsData = JSON.parse(listsText)
  const allLists = listsData.d?.results || []
  const lists: SharePointList[] = []
  const documentLibraries: SharePointList[] = []

  // Process all lists
  for (const list of allLists) {
    const sharePointList: SharePointList = {
      id: list.Id,
      title: list.Title,
      baseTemplate: list.BaseTemplate,
      baseTemplateDescription: getSharePointListTypeDescription(list.BaseTemplate),
      itemCount: list.ItemCount || 0,
      hidden: list.Hidden || false,
      description: list.Description || '',
      defaultViewUrl: list.DefaultViewUrl || '',
    }

    lists.push(sharePointList)

    // Document libraries have BaseTemplate 101
    if (list.BaseTemplate === 101 && !list.Hidden) {
      documentLibraries.push(sharePointList)
    }
  }

  return { lists, documentLibraries }
}
