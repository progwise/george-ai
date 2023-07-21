import playwright from 'playwright'

const doScrape = async () => 
{
  const browser = await playwright['chromium'].launch({headless: false})
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto("https://www.medizin.uni-greifswald.de/")
  const acceptCookies = await page.getByText(/alle akzeptieren/i);
  await Promise.all((await acceptCookies.all()).map(async button => button.click()))
  const links = await page.getByRole('link').all()
  await page.waitForTimeout(2000)
  const originalPageUrl = page.url()
  
  for(let i=0;i<links.length;i++) {
    const textContent = await links[i].textContent()
    if(textContent && textContent?.trim().length<1) {
      await links[i].click()
      await page.waitForTimeout(500)
      if (page.url() !== originalPageUrl) {
        await page.goBack()

      }
    }
  }
  await browser.close()
}

await doScrape();
