const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const dir = "f:\\Invincx Projects\\myraaha-dev\\docs\\google_maps_ui_references";
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    
    // Desktop
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    console.log("Navigating to Google Maps Desktop...");
    
    // 1. Desktop Search / Place Details
    await page.goto('https://www.google.com/maps/place/New+York', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(dir, '1_desktop_place_details.png') });
    console.log("Saved 1_desktop_place_details.png");
    
    // 2. Desktop Directions / PathFinder
    await page.goto('https://www.google.com/maps/dir/New+York/Boston', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(dir, '2_desktop_directions_pathfinder.png') });
    console.log("Saved 2_desktop_directions_pathfinder.png");
    
    // Mobile
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
    
    console.log("Navigating to Google Maps Mobile...");
    
    // 3. Mobile Explore Map (Default view)
    await mobilePage.goto('https://www.google.com/maps/@37.7749,-122.4194,13z', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    await mobilePage.screenshot({ path: path.join(dir, '3_mobile_explore_map.png') });
    console.log("Saved 3_mobile_explore_map.png");

    // 4. Mobile Place Details (Bottom Sheet UI)
    await mobilePage.goto('https://www.google.com/maps/place/San+Francisco', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    await mobilePage.screenshot({ path: path.join(dir, '4_mobile_bottom_sheet_details.png') });
    console.log("Saved 4_mobile_bottom_sheet_details.png");
    
    // 5. Mobile Directions (Route Selection UI)
    await mobilePage.goto('https://www.google.com/maps/dir/San+Francisco/Los+Angeles', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    await mobilePage.screenshot({ path: path.join(dir, '5_mobile_directions_routes.png') });
    console.log("Saved 5_mobile_directions_routes.png");

    await browser.close();
    console.log("Finished saving all screenshots to: " + dir);
  } catch (err) {
    console.error("Error running puppeteer:", err);
  }
})();
