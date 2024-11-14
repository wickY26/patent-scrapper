import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getNiceDescriptions = async ({ page }) => {
  try {
    if (!process.env.APP_NUMBER) {
      throw new Error("APP_NUMBER belirtilmemiş");
    }
  } catch (error) {
    console.log(
      "Başvuru numarasi belirtilmemiş, lütfen komutu su sekilde calistirin:"
    );
    console.error("APP_NUMBER=123456789 npm run start");
    return;
  }

  const appNumber = process.env.APP_NUMBER;
  const dirPath = path.join(__dirname, "docs", appNumber);

  // Intercept the response
  page.on("response", async (response) => {
    if (response.url().includes("/api/research")) {
      const responseBody = await response.json();
      console.info("Sonuclar alındı...");
      try {
        const descriptionsByCode =
          responseBody.payload.item.niceInformation.reduce(
            (acc, { niceDescription, niceCode }) => {
              niceDescription = niceDescription.replace(/\n+/g, " "); // Replace multiple newlines with a single space
              if (!acc[niceCode]) {
                acc[niceCode] = [];
              }
              acc[niceCode].push(niceDescription);
              return acc;
            },
            {}
          );

        // Create directory if it doesn't exist
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        for (const [niceCode, descriptions] of Object.entries(
          descriptionsByCode
        )) {
          fs.writeFileSync(
            path.join(dirPath, `code-${niceCode}.txt`),
            descriptions.join("").replace(/\s+/g, " ")
          );
        }
        console.info("Dosyalar oluşturuldu...");
        console.info("Klasor: ", dirPath);
      } catch (error) {
        console.info("Hata oluştu, yilmayin bir daha deneyin :D", error);
      }
    }
  });

  // Go to the website
  console.info("Websiteye gidiliyor...");
  await page.goto("https://www.turkpatent.gov.tr/arastirma-yap");

  console.info("Pop-up kapatiliyor...");
  // Close the modal
  await page.click(".jss92"); // Click the button with class 'jss92'

  // Click the button
  console.info("Dosya takibi sekmesine gidiliyor...");
  await page.click('span:has-text("Dosya Takibi")');

  // Fill the input field
  console.info("Başvuru numarasi giriliyor...");
  await page.fill('input[placeholder="Başvuru Numarası"]', appNumber);

  // Click the submit button
  console.info("Sorgula butonuna tıklanıyor...");
  await page.click('span:has-text("Sorgula")');

  // Wait for some time to ensure the response is intercepted
  console.info("Sonuç bekleniyor...");
  await page.waitForTimeout(5000);
};
