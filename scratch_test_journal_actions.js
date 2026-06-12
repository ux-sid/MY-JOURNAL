import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173/';
const SCRATCH_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\b9c4254d-b248-406c-b6b2-c20f0ccd0793\\scratch';

async function run() {
  console.log('Starting automated browser test...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Capture console messages from browser
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type().toUpperCase(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.toString()));

  try {
    // 1. Navigate to page
    console.log(`Navigating to ${APP_URL}...`);
    await page.evaluateOnNewDocument(() => {
      window.addEventListener('click', (e) => {
        const path = e.composedPath().map(el => {
          if (!el || !el.tagName) return '';
          let className = '';
          if (el.className) {
            if (typeof el.className === 'string') {
              className = el.className;
            } else if (typeof el.className.baseVal === 'string') {
              className = el.className.baseVal;
            }
          }
          return el.tagName + (className ? '.' + className.trim().split(/\s+/).join('.') : '');
        }).filter(Boolean).join(' -> ');

        console.log('WINDOW CLICK:' + JSON.stringify({
          tagName: e.target.tagName,
          text: (e.target.innerText || e.target.textContent || '').substring(0, 30),
          path: path
        }));
      }, true);
    });
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(SCRATCH_DIR, '01_login_page.png') });

    // 2. Click sign in button
    console.log('Clicking "Sign in with Google"...');
    const signInBtn = await page.waitForSelector('button ::-p-text(Sign in with Google)', { timeout: 5000 });
    await signInBtn.click();
    
    // Wait for account selector to render and select Alexander Vance
    console.log('Selecting "Alexander Vance" account...');
    const accountBtn = await page.waitForSelector('button ::-p-text(Alexander Vance)', { timeout: 5000 });
    await accountBtn.click();
    
    // Wait for main library grid view to load
    console.log('Waiting for Library view to load...');
    await page.waitForSelector('h1 ::-p-text(Aetheria Library)', { timeout: 10000 });
    await page.screenshot({ path: path.join(SCRATCH_DIR, '02_library_loaded.png') });

    // --- TEST SHARING FEATURE ---
    console.log('--- Testing Share & Invite Feature ---');
    // Get all book cards
    const bookCards = await page.$$('.group.relative');
    console.log(`Found ${bookCards.length} books in library.`);
    
    if (bookCards.length > 0) {
      // Open dropdown options of the first book
      console.log('Opening settings dropdown on the first book...');
      const moreBtn = await bookCards[0].$('button');
      await moreBtn.click();
      
      // Wait 300ms for dropdown animation to complete
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 300)));
      await page.screenshot({ path: path.join(SCRATCH_DIR, '02.5_dropdown_open_share.png') });
      
      // Wait for and click "Share & Invite" option
      console.log('Clicking "Share & Invite" dropdown option...');
      const shareOption = await page.waitForSelector('button ::-p-text(Share & Invite)', { timeout: 5000 });
      await shareOption.click();
      
      // Wait for modal to render
      console.log('Waiting for Share Modal to open...');
      await page.waitForSelector('h3 ::-p-text(Share)', { timeout: 5000 });
      await page.screenshot({ path: path.join(SCRATCH_DIR, '03_share_modal_open.png') });

      // Enter email and click invite
      console.log('Entering email "new.collaborator@aetheria.io"...');
      const emailInput = await page.$('input[placeholder="colleague@example.com"]');
      await emailInput.type('new.collaborator@aetheria.io');
      
      console.log('Clicking the add collaborator button...');
      // Find the add button (the one with the Plus icon inside form)
      const addCollabBtn = await page.$('form button[type="submit"]');
      await addCollabBtn.click();
      
      // Wait to see if collaborator is added to the UI list
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
      await page.screenshot({ path: path.join(SCRATCH_DIR, '04_share_modal_after_invite.png') });

      // Check if collaborator list contains our new email
      const collabEmailsText = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('.flex.items-center.justify-between.px-3.py-2 p'));
        return els.map(el => el.textContent);
      });
      console.log('Emails currently visible in share modal list:', collabEmailsText);

      // Close share modal
      console.log('Closing share modal...');
      const doneBtn = await page.waitForSelector('button ::-p-text(Done)', { timeout: 5000 });
      await doneBtn.click();
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    }

    // --- TEST DELETING FEATURE ---
    console.log('--- Testing Delete Book Feature ---');
    // Get fresh list of book cards
    const freshBookCards = await page.$$('.group.relative');
    const initialBookCount = freshBookCards.length;
    console.log(`Initial book count: ${initialBookCount}`);

    if (initialBookCount > 0) {
      // Let's get the title of the book we want to delete
      const bookTitle = await page.evaluate(card => {
        return card.querySelector('h3').textContent.trim();
      }, freshBookCards[0]);
      console.log(`Attempting to delete book titled: "${bookTitle}"`);

      // Open dropdown on the book
      const moreBtn = await freshBookCards[0].$('button');
      await moreBtn.click();

      // Wait 300ms for dropdown animation to complete
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 300)));
      await page.screenshot({ path: path.join(SCRATCH_DIR, '04.5_dropdown_open_delete.png') });

      // Log coordinates of the Delete Journal button and the cover emoji
      const coords = await page.evaluate(() => {
        const deleteBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Delete Journal'));
        const emojiSpan = Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes('🕯️'));
        return {
          deleteBtn: deleteBtn ? deleteBtn.getBoundingClientRect().toJSON() : null,
          emojiSpan: emojiSpan ? emojiSpan.getBoundingClientRect().toJSON() : null
        };
      });
      console.log('Coordinates on delete step:', coords);

      // Wait for and click "Delete Journal" option
      console.log('Clicking "Delete Journal" dropdown option...');
      const deleteOption = await page.waitForSelector('button ::-p-text(Delete Journal)', { timeout: 5000 });
      await deleteOption.click();

      // Wait for Dialog to render
      console.log('Waiting for Delete Confirmation Dialog to open...');
      await page.waitForSelector('h3 ::-p-text(Delete Notebook)', { timeout: 5000 });
      await page.screenshot({ path: path.join(SCRATCH_DIR, '05_delete_dialog_open.png') });

      // Click "Delete Notebook" button
      console.log('Clicking "Delete Notebook" confirmation button...');
      const confirmDeleteBtn = await page.waitForSelector('button ::-p-text(Delete Notebook)', { timeout: 5000 });
      await confirmDeleteBtn.click();

      // Wait 2s for modal to close and state to update
      console.log('Waiting for state updates and list refresh...');
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
      await page.screenshot({ path: path.join(SCRATCH_DIR, '06_after_delete_confirm.png') });

      // Check current book cards count
      const postDeleteCards = await page.$$('.group.relative');
      console.log(`Post-delete book count: ${postDeleteCards.length}`);
      if (postDeleteCards.length === initialBookCount - 1) {
        console.log('SUCCESS: Book was successfully deleted!');
      } else {
        console.log('FAILURE: Book count did not decrease!');
      }
    } else {
      console.log('No books available to test deleting.');
    }

  } catch (error) {
    console.error('ERROR DURING BROWSER TEST:', error);
    console.log('Current URL on error:', page.url());
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Page body text snippet:\n', bodyText.substring(0, 500));
    await page.screenshot({ path: path.join(SCRATCH_DIR, 'error_page.png') });
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

run();
