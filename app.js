/* Joyful Casa: static HTML/CSS/JS frontend + Supabase persistence.
   Set SUPABASE_URL and SUPABASE_ANON_KEY below after creating your project. */
const SUPABASE_URL = "https://mthxgxrgiaxzelltmoiu.supabase.co";
const SUPABASE_ANON_KEY = "Ysb_publishable_WyRbpxxvvOHaxe9s_IubEQ_X-hLL2Zr";
const CONFIGURED = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_");
const supabase = CONFIGURED ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const $ = id => document.getElementById(id);
const starter = {
  brand:"Joyful Casa",kicker:"A little home for a joyful life",heroTitle:"Welcome to Joyful Casa",
  heroCopy:"Thoughtful living, everyday inspiration, and little things that make a house feel like home.",
  footer:"Made with love at Joyful Casa",
  theme:{bg:"#fbf6ef",card:"#fffdf9",ink:"#463a34",accent:"#a56f5b",soft:"#e9d4c5"},
  sections:[
    {id:"welcome",title:"A warm welcome",type:"page",blocks:[
      {id:"b-welcome",type:"text",html:"<p>Come on in. This is a space to share the things I love, the ideas I’m exploring, and a little inspiration for your own home and heart.</p>"},
      {id:"b-photo",type:"image",url:"",alt:"A favorite photo",caption:""}
    ]},
    {id:"journal",title:"The Journal",type:"blog",blocks:[
      {id:"b-journal-intro",type:"text",html:"<p>Stories, reflections, recipes, and little moments from everyday life.</p>"}
    ]},
    {id:"favorites",title:"My doTERRA favorites",type:"shop",blocks:[
      {id:"b-shop-intro",type:"text",html:"<p>Explore some of my favorite doTERRA products. Each link opens the product page.</p>"},
      {id:"b-shop-link",type:"link",label:"Explore doTERRA",url:"https://www.doterra.com"}
    ]}
  ]
};
let site = structuredClone(starter), selectedSectionId = site.sections[0].id, isAdmin = false, dirty = false;
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const id = () => "b-" + Math.random().toString(36).slice(2,10);
const currentSection = () => site.sections.find(s=>s.id===selectedSectionId) || site.sections[0];
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function markDirty(){dirty=true;$("saveMessage").textContent="Unsaved changes";renderSite();renderEditor()}
function cssVars(){const t=site.theme;document.documentElement.style.setProperty("--bg",t.bg);document.documentElement.style.setProperty("--card",t.card);document.documentElement.style.setProperty("--ink",t.ink);document.documentElement.style.setProperty("--accent",t.accent);document.documentElement.style.setProperty("--soft",t.soft)}
function safeLink(url){try{const u=new URL(url);return ["http:","https:"].includes(u.protocol)?u.href:"#"}catch{return "#"}}
function blockHTML(b){
 if(b.type==="text")return `<div class="section-body">${b.html||""}</div>`;
 if(b.type==="image")return b.url?`<figure><img src="${esc(b.url)}" alt="${esc(b.alt||"")}">${b.caption?`<figcaption class="caption">${esc(b.caption)}</figcaption>`:""}</figure>`:`<p class="hint">Image placeholder — add an image URL in the editor.</p>`;
 if(b.type==="link")return `<a class="product-link" href="${esc(safeLink(b.url))}" target="_blank" rel="noopener">${esc(b.label||"Open link")} ↗</a>`;
 if(b.type==="blogpost")return `<article class="blog-card"><h3>${esc(b.title||"Untitled post")}</h3><p>${esc(b.excerpt||"")}</p>${b.image?`<img src="${esc(b.image)}" alt="" style="width:100%;border-radius:8px;margin:8px 0">`:""}<details><summary>Read article</summary><div>${b.body||""}</div></details></article>`;
 return "";
}
function renderSite(){
 cssVars();$("siteBrand").textContent=site.brand;$("heroKicker").textContent=site.kicker;$("heroTitle").textContent=site.heroTitle;$("heroCopy").textContent=site.heroCopy;$("siteFooter").textContent=site.footer;
 $("siteNav").innerHTML=site.sections.map(s=>`<a href="#section-${esc(s.id)}">${esc(s.title)}</a>`).join("");
 $("pageSections").innerHTML=site.sections.map(s=>`<section class="site-section" id="section-${esc(s.id)}"><h2>${esc(s.title)}</h2>${s.type==="blog"?`<div class="blog-list">${s.blocks.map(blockHTML).join("")}</div>`:s.blocks.map(blockHTML).join("")}</section>`).join("");
}
function field(label,key,value,kind="text"){
 return `<label>${label}${kind==="textarea"?`<textarea data-key="${key}">${esc(value)}</textarea>`:`<input data-key="${key}" type="${kind}" value="${esc(value)}">`}</label>`;
}
function renderEditor(){
 if(!isAdmin)return;
 $("editBrand").value=site.brand;$("editHeroTitle").value=site.heroTitle;$("editHeroCopy").value=site.heroCopy;$("editKicker").value=site.kicker;$("editFooter").value=site.footer;
 const s=currentSection();$("editSectionTitle").value=s?.title||"";
 $("colorBg").value=site.theme.bg;$("colorCard").value=site.theme.card;$("colorText").value=site.theme.ink;$("colorAccent").value=site.theme.accent;$("colorSoft").value=site.theme.soft;
 $("sectionList").innerHTML=site.sections.map((x,i)=>`<div class="section-row"><button class="section-select" data-select="${x.id}">${esc(x.title)} <small>(${x.type})</small></button><button data-up="${i}" ${i===0?"disabled":""}>↑</button><button data-down="${i}" ${i===site.sections.length-1?"disabled":""}>↓</button><button class="remove" data-del="${x.id}">×</button></div>`).join("");
 $("blockEditor").innerHTML=(s?.blocks||[]).map((b,i)=>`<div class="block-item"><div class="block-item-head"><span>${esc(b.type==="blogpost"?"Blog post":b.type)}</span><span class="block-actions"><button data-bup="${i}" ${i===0?"disabled":""}>↑</button><button data-bdown="${i}" ${i===s.blocks.length-1?"disabled":""}>↓</button><button class="remove" data-bdel="${b.id}">Remove</button></span></div>${b.type==="text"?field("Text (HTML allowed)","html",b.html,"textarea"):b.type==="image"?field("Image URL","url",b.url)+field("Alt text","alt",b.alt)+field("Caption","caption",b.caption):b.type==="link"?field("Link label","label",b.label)+field("Destination URL","url",b.url,"url"):b.type==="blogpost"?field("Post title","title",b.title)+field("Short summary","excerpt",b.excerpt,"textarea")+field("Image URL (optional)","image",b.image,"url")+field("Article body (HTML allowed)","body",b.body,"textarea"):""}</div>`).join("");
}
function editorValues(){site.brand=$("editBrand").value;site.heroTitle=$("editHeroTitle").value;site.heroCopy=$("editHeroCopy").value;site.kicker=$("editKicker").value;site.footer=$("editFooter").value;const s=currentSection();if(s)s.title=$("editSectionTitle").value}
async function fetchSite(){
 if(!supabase)return;
 const {data,error}=await supabase.from("joyful_casa_content").select("content").eq("id",1).maybeSingle();
 if(!error&&data?.content){site=data.content;selectedSectionId=site.sections[0]?.id||null}
 renderSite();
}
async function signIn(){
 $("loginError").textContent="";
 if(!supabase){$("loginError").textContent="Set up Supabase in app.js and run the SQL setup first.";return}
 const {error}=await supabase.auth.signInWithPassword({email:$("adminEmail").value,password:$("adminPassword").value});
 if(error){$("loginError").textContent=error.message;return}
 isAdmin=true;$("loginDialog").close();$("editor").classList.remove("hidden");renderEditor();toast("Editor unlocked");
}
async function signOut(){if(supabase)await supabase.auth.signOut();isAdmin=false;$("editor").classList.add("hidden");toast("Signed out")}
async function saveSite(){
 editorValues();
 if(!supabase){toast("Connect Supabase before saving online.");return}
 const {error}=await supabase.from("joyful_casa_content").upsert({id:1,content:site});
 if(error){toast("Could not save: "+error.message);return}
 dirty=false;$("saveMessage").textContent="Saved and published";toast("Joyful Casa is updated");renderSite();
}
function addBlock(type){
 const s=currentSection();if(!s)return;
 const b=type==="text"?{id:id(),type,html:"<p>Write something lovely here.</p>"}:
 type==="image"?{id:id(),type,url:"",alt:"Describe the image",caption:""}:
 type==="link"?{id:id(),type,label:"Visit this page",url:"https://"}:
 type==="blogpost"?{id:id(),type,title:"A new journal entry",excerpt:"A short introduction…",image:"",body:"<p>Write your post here.</p>"}:
 {id:id(),type:"link",label:"View doTERRA product",url:"https://www.doterra.com"};
 s.blocks.push(b);markDirty();
}
function addSection(type){
 const title=type==="blog"?"New journal":type==="shop"?"New shop":"New page";
 const s={id:id(),title,type,blocks:[]};site.sections.push(s);selectedSectionId=s.id;markDirty();$("tab-pages").classList.remove("hidden");switchTab("pages");
}
function switchTab(tab){document.querySelectorAll(".editor-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("hidden",p.id!=="tab-"+tab))}
$("adminOpen").onclick=()=>{if(isAdmin){$("editor").classList.toggle("hidden");return}$("loginDialog").showModal()};
$("loginButton").onclick=signIn;$("logoutButton").onclick=signOut;$("saveButton").onclick=saveSite;
$("editor").addEventListener("click",e=>{
 const t=e.target;
 if(t.dataset.tab)switchTab(t.dataset.tab);
 if(t.dataset.select){selectedSectionId=t.dataset.select;renderEditor()}
 if(t.dataset.del){site.sections=site.sections.filter(s=>s.id!==t.dataset.del);selectedSectionId=site.sections[0]?.id||null;markDirty()}
 if(t.dataset.up!==undefined){let i=+t.dataset.up;[site.sections[i-1],site.sections[i]]=[site.sections[i],site.sections[i-1]];markDirty()}
 if(t.dataset.down!==undefined){let i=+t.dataset.down;[site.sections[i+1],site.sections[i]]=[site.sections[i],site.sections[i+1]];markDirty()}
 if(t.dataset.bdel){currentSection().blocks=currentSection().blocks.filter(b=>b.id!==t.dataset.bdel);markDirty()}
 if(t.dataset.bup!==undefined){let a=currentSection().blocks,i=+t.dataset.bup;[a[i-1],a[i]]=[a[i],a[i-1]];markDirty()}
 if(t.dataset.bdown!==undefined){let a=currentSection().blocks,i=+t.dataset.bdown;[a[i+1],a[i]]=[a[i],a[i+1]];markDirty()}
});
$("editor").addEventListener("input",e=>{
 const t=e.target;
 if(t.id.startsWith("color")){const key={colorBg:"bg",colorCard:"card",colorText:"ink",colorAccent:"accent",colorSoft:"soft"}[t.id];site.theme[key]=t.value;cssVars();dirty=true;$("saveMessage").textContent="Unsaved changes";return}
 if(t.dataset.key){const block=currentSection().blocks.find(b=>b.id===t.closest(".block-item")?.querySelector("[data-bdel]")?.dataset.bdel);if(block){block[t.dataset.key]=t.value;dirty=true;$("saveMessage").textContent="Unsaved changes";renderSite()}}
 if(["editBrand","editHeroTitle","editHeroCopy","editKicker","editFooter","editSectionTitle"].includes(t.id)){editorValues();dirty=true;$("saveMessage").textContent="Unsaved changes";renderSite()}
});
$("addText").onclick=()=>addBlock("text");$("addImage").onclick=()=>addBlock("image");$("addLink").onclick=()=>addBlock("link");$("addBlogPost").onclick=()=>addBlock("blogpost");$("addProduct").onclick=()=>addBlock("product");
$("newPage").onclick=()=>addSection("page");$("newBlog").onclick=()=>addSection("blog");$("newShop").onclick=()=>addSection("shop");
if(supabase){supabase.auth.getSession().then(({data})=>{if(data.session){isAdmin=true;$("editor").classList.remove("hidden");renderEditor()}})}
renderSite();fetchSite();
