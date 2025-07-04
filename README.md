<h1 align="center">Konichivass!!</h1>

So, you looked at this repo, right?  
Isn't it interesting how we can just apply our own rules by writing a few lines of JS?
---
Quick Faqs - 
<details> <summary><strong>What is this repo for?</strong></summary>
This repo is made for a Chrome extension targeting the KL University ERP portal. Basically, it’s a Chrome extension designed to enhance the KL U ERP website experience.
</details>
<details><summary><strong>ok What is the purpose , Purpose enti ⁉️</strong></summary>
Just for fun , i intially though of doing it for me personally but made this as public, so if anyone got any new ideas to add into our erp just include them in issues section 
</details>
<details> <summary><strong>How to set up the Chrome Extension on your device?</strong></summary>
 <ul> <li>Download the zip file from the Releases section.</li>
  <li>See these sample images if you cant find the releases.</li>
<div style="display: flex; flex-direction: row; gap: 10px; align-items: center;">
  <img src="https://github.com/user-attachments/assets/ae086cf0-83c9-47a4-a600-3ba1884b9179" width="250" height="300"/>
  <img src="https://github.com/user-attachments/assets/e83a48a1-adf9-461a-ad93-291e720ffdd7" width="500"/>
</div>
 <li> Extract the zip file.</li>
<li>Next, you need to add your own Gemini API key:</li>

<li>Visit <a href="https://aistudio.google.com/" target="_blank">Google AI Studio</a></li>
  <li>Sign in or create your account.</li>
  <li>Click the <strong>Get API</strong> button on the top-right corner.<br>
    <img src="https://github.com/user-attachments/assets/3492ff89-a121-4347-b248-b1a2af94231a" width="500"/>
  </li>
  <li>Click on <strong>Create API Key</strong>.<br>
    <img src="https://github.com/user-attachments/assets/fc3000b8-81b9-4c59-9597-bcad97f5c9b2" width="500"/>
  </li>
  <li>After the key is created, copy it.</li>
  <li>Go back to your extracted repo folder.</li>
  <li>Create a <code>.env</code> file and add the API key like this:
    <pre><code>GEMINI_API_KEY=your_key_here</code></pre>
  </li>
  <li>Now, open <strong>Chrome</strong> and go to the <strong>Extensions</strong> page:<br>
    <img src="https://github.com/user-attachments/assets/9cf39eb2-cc61-4186-8df0-019ff426fd58" width="500"/>
  </li>
  <li>Enable <strong>Developer mode</strong> (top-right corner):<br>
    <img src="https://github.com/user-attachments/assets/44f846d0-99df-4b9e-b30e-45e3a174afb0" width="500"/>
  </li>
  <li>Click on <strong>Load unpacked</strong>, and select the folder you extracted:<br>
    <img src="https://github.com/user-attachments/assets/3caa3f87-0964-4bb4-9c3c-365843dd0195" width="500"/><br>
    <img src="https://github.com/user-attachments/assets/a73758c3-9d0c-468d-9ed6-8460b84f7f21" width="500"/>
  </li>
  <h1>and boom you got my extension on your device running 🎊</h1>
</ul>
</details>
<details><summary><strong>What's new in erp now? em pikav nuvvu ippudu 🤨</strong></summary>
<h3>Well you opened this question so wanna know what i cooked?</h3>
  <ul>
    <li>
      new landing page 
    </li>
     <img src="https://github.com/user-attachments/assets/4026330a-2c62-46e1-9ce9-57ca7839995d" width="500"/>
    <li>
      Custom music player 
    </li>
   <img src="https://github.com/user-attachments/assets/6e298b94-c57b-4d0a-a2d6-84849c436239" height="300" width="300"/>
<li>
  new home page
</li>
    <li>
      added buttons for checking <b>average attendace </b> and <b>attendance when bunked classess</b>
    </li>
    <li>
      added sorting feature to every table, intially i planned to do this only for payments, but it turned out liket this 😅,now every table in erp works like excel sheet you can apply sorting to it 
    </li>
   <img src="https://github.com/user-attachments/assets/aeed05fd-4cac-4539-af93-e58dbbe98c00" width = "300" height="200"/>
<li>Added motivation button beside sgpa & cgpa , try it out it will be a lot of fun</li>
    <li>
      Added gemini ai support so whenevr you select the text one pop up will open you can ask questions about the text selected in erp.
    </li>
      <img src="https://github.com/user-attachments/assets/0c1f979b-fabf-463e-8032-02ea7aae2de0" width="500"/>
    <li>And last added small prank button , not gonna tell about it - just try yourself</li>
  </ul>
</details>
<details><summary><strong>So you said custom music player , how can i add my songs there?</strong></summary>
<li>ok when you open the extension folder you will music folder just upload your songs there and make sure to register the song files in files.json</li>
<li>  it is like this -  </li>
  <img src="https://github.com/user-attachments/assets/5e2ea181-7d99-4004-ba27-f71f42bd221e" height="156" width="156"/>

</details>
---

## **TO-DO**

- [ ] Add image support to Gemini API  
- [ ] Fix the small errors  
- [ ] Add more insect GIFs and update the shaking animation  
- [ ] Change the CSS of the sidebar  
- [ ] Change the home page UI and add a dynamically placed logout button  

---

<h2 align="center">Congrats visitor, you have unlocked your own browser extension 🗣️🗣️🎊</h2>

<h3 align="center">Got any suggestions or new features? Drop them in the Issues section.</h3>

---

## 📝 Small Note

**Please don’t be offended if you don’t like the theme — I like it 😄 THIS repo updates continuously, so it is better to update your extension weekly**

<h3>If you liked my work please star this repo ^_~ </h3>
