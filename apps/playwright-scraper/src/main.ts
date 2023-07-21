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
  
  for(let i=0;i<links.length;i++) {
    await links[i].click()
    await page.waitForTimeout(500)
    await page.goBack()
  }
  await browser.close()
}

await doScrape();
