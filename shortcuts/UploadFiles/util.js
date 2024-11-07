// range for js
function range(start, end) {
  let array = [];
  for (let i = start; i < end; ++i) {
    array.push(i);
  }
  return array;
}


// grid rank
function gridRankSetting(rankClass, noneRowClass){
  const gridRank = document.querySelectorAll(`.${rankClass}`);
  gridRank.forEach((item)=>{
    const rankOkUnique = item.querySelectorAll(`.${noneRowClass}.clickableCell`);
    const clickCells = item.querySelectorAll('.clickableCell');
    
    clickCells.forEach( (cell) => {
      cell.classList.add(`rank_${cell.headers.split("_")[1]}`);
    });

    if( rankOkUnique.length !== 0 ){
      item.onchange = () => {
        [...rankOkUnique].slice(0,-1).forEach( (unique, index)=>{
          const rankInput = unique.querySelector("input[type=radio]");
          if( rankInput !== null && rankInput !== undefined ){
            if( rankInput.checked ){
              const sliceRankOkUnique = [...rankOkUnique].slice(index+1);
              sliceRankOkUnique.forEach((auto)=>{
                const autoRankInput = auto.querySelector("input[type=radio]");
                const autoRankFir = auto.querySelector(".fir-icon");
                autoRankInput.checked = true;
                autoRankFir.classList.add("selected");

                const rankClass = `.rank_${auto.headers.split("_")[1]}`;
                const disabledRows = document.querySelectorAll(rankClass);
                disabledRows.forEach( (row)=>{
                  if( ![...row.classList].includes(noneRowClass) ){
                    const rowRankInput = row.querySelector("input[type=radio]");
                    const rowRankFir = row.querySelector(".fir-icon");
                    
                    rowRankInput.checked = false;
                    rowRankFir.classList.remove("selected");
                  }
                });
              })
            }
          }
        });
      }
    }
  });
}

// 한글 변환
function viewKorean(num, dan, postText){
  string=num;
  hn = new Array("영","일","이","삼","사","오","육","칠","팔","구");
  hj = new Array("","만","억","조","경","해","시","양","구","간","정","재","극","항하사","아승지","나유타","불가사의","무량대수");
  ul = new Array("영천","영백","영십","영");
  tm = new Array();
  result = "";
  string = string + dan;  // 금액 단위
  if (string.charAt(0)=="-"){ result = "마이너스 "; string = string.substr(1,string.length-1); }
  loop_size = Math.ceil(string.length/4);
           string2 = "";
  for (count=string.length; count >= 0; count--)
      string2 += string.substring(count,count-1);
           string = string2;
  for (A=0;A<loop_size;A++)
  {
    sum = hj[A] + " ";
    tm[A] = string.substr(A*4,4);
    tm2 = "";
    for (count=tm[A].length; count >= 0; count--)
        tm2 += tm[A].substring(count,count-1);
        tm[A] = tm2;
        part_jari = tm[A].length;
        for (D=0;D<10;D++){
          for (B=0;B<10;B++) tm[A] = tm[A].replace(B,hn[B]);
        }
    if (part_jari == 4) tm[A] = tm[A].charAt(0)+"천"+tm[A].charAt(1)+"백"+tm[A].charAt(2)+"십"+tm[A].charAt(3);
    else if (part_jari == 3) tm[A] = tm[A].charAt(0)+"백"+tm[A].charAt(1)+"십"+tm[A].charAt(2);
    else if (part_jari == 2) tm[A] = tm[A].charAt(0)+"십"+tm[A].charAt(1);
    else tm[A] = tm[A].charAt(0);
    for (C=0;C<4;C++)
    {
     if (tm[A].match(ul[C])){ part_jari--; tm[A] = tm[A].replace(ul[C],""); }
    }
    if (part_jari != 0) tm[A] += sum;
  }
  for (loop_size;loop_size>-1;loop_size--) result += tm[loop_size];
    result = result.replace("undefined","");
    if( result === "" || result === null || result === undefined ){
      return "";
    }

    result = result.replace("undefined","") + postText;
    return result;
}

function han(dan, postText){
  const hangleChange = document.querySelectorAll(".hanchange");
  let hangelPostText = "원";
  if( !(postText === null || postText === undefined || postText === "") ){
      hangelPostText = postText;
  }
  hangleChange.forEach((item)=>{
    const itemInput = item.querySelector("input");

    const hanFunction = (num) => {
      let numToHan = viewKorean(num, dan, hangelPostText);
      const hangleSpan = item.querySelector(".hangle-span");
      hangleSpan.innerHTML = numToHan;
    }
    hanFunction( !isNaN(itemInput.value) && itemInput.value);
    itemInput.addEventListener("keyup", (event)=>{
      hanFunction(event.target.value);
    });
  });
}


// set animation
function setAnimation(selector, animate, duration){
  const setClass = document.querySelector(selector);
  setClass.classList.add("animate__animated");
  setClass.classList.add(animate);
  if( duration !== undefined && duration !== null ){
      setClass.style.setProperty('--animate-duration', duration);
  }
}

// radio, checkbox hover animation
function setFirAnimation(){
  window.addEventListener('load', function(){
    for(i = 0; i < document.getElementsByClassName('fir-selected').length; i++){
      document.getElementsByClassName('fir-base')[i].style.transitionDuration = '0.15s';
      document.getElementsByClassName('fir-selected')[i].style.transitionDuration = '0.15s';
    }
  })
}

// text hover bold
function setHoverTextBold(){
  function fnBoldStyle(){
    for(k = 0; k < document.querySelectorAll('style').length; k++){
      if (document.querySelectorAll('style')[k].getAttribute('media') == null){
       document.querySelectorAll('style')[k].innerHTML = document.querySelectorAll('style')[k].innerHTML + '.bold {font-weight : bold;}';
       break;
      }
    }
  }
  window.addEventListener('load', function(){
    fnBoldStyle();
    for (i = 0; i < document.querySelectorAll('#surveyContainer .clickable').length; i++){
      document.querySelectorAll('#surveyContainer .clickable')[i].addEventListener('mouseenter', function(e){
        this.classList.add('bold');
      })
      document.querySelectorAll('#surveyContainer .clickable')[i].addEventListener('mouseleave', function(e){
        this.classList.remove('bold')
      })
    }
  })
}

// Slideshow setting
function slideShowSetting({
    setSlideshowQuery='.slideshow-div',
    mode,
    imagePath,
    imageClassName,
    slides=[],
    force=false,
    forceText,
    forceSwitch='.continue',
    holdPageSec=0,
}){
    if(setSlideshowQuery === null || setSlideshowQuery === undefined || setSlideshowQuery === ''){
        console.log('Slideshow setSlideshowQuery error');
        return
    }

    if( !['image', 'html'].includes(mode) ){
        console.log('Slideshow mode error');
        return
    }

    if( !Array.isArray(slides) ){
        console.log('The slides argument is not Array.');
        return
    }
    if( slides.length === 0 ){
        console.log('The slides argument is empty');
        return
    }

    if( mode === 'image' && (imagePath === null || imagePath === undefined )){
        console.log('The slideshow mode is image. Please check the image path');
        return
    }

    if( !typeof imageClassName === 'string' ){
        console.log('The imageClassName is not string.');
        return
    }

    if( !typeof force === 'boolean' ){
        console.log('Slideshow force argument must be boolean');
        return
    }
    if(force === true){
        if(forceText === null || forceText === undefined){
            console.log('The force argument is true. Please check the forceText');
            return
        }
        if( forceSwitch === null || forceSwitch === undefined){
            console.log('The force argument is true. Please check the forceSwitch');
            return
        }
        const forceBtnChk = document.querySelector(forceSwitch);
        if( forceBtnChk === null || forceBtnChk === undefined){
            console.log('The force argument is true. However, the forceSwitch not found');
            return
        }
    }

    const activeColor = '#2d6df6';
    const defaultFontColor = '#343333';
    const activeFontColor = '#fff';
    const defaultColor = '#f7f7f7';
    const dotColor = '#b7b4b4';

    const slideshowDiv = document.querySelector(setSlideshowQuery);
    slideshowDiv.innerHTML = null;
    slideshowDiv.style.width = '100%';
    slideshowDiv.style.marginBottom = '20px';
    slideshowDiv.style.maxWidth = '924px';
    //slideshowDiv.style.margin = '0 auto';

    const slideshowBody = document.createElement('div');
    const leftBtn = document.createElement('div');
    const slideshow = document.createElement('div');
    const rightBtn = document.createElement('div');

    /* Make slide show */
    slideshowDiv.appendChild(slideshowBody);
    slideshowBody.appendChild(leftBtn);
    slideshowBody.appendChild(slideshow);
    slideshowBody.appendChild(rightBtn);

    slideshowBody.classList.add('animate__animated');
    slideshowBody.classList.add('animate__fadeIn');
    slideshowBody.style.width = '100%';
    slideshowBody.style.display = 'grid';
    slideshowBody.style.gridTemplateColumns = '5% 90% 5%';

    leftBtn.classList.add('slideshow-btn');
    slideshow.classList.add('slideshow-pages');
    rightBtn.classList.add('slideshow-btn');

    const slideshowBtns = document.querySelectorAll('.slideshow-btn');

    const leftArrowSVG = `<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-6 h-6'> <path stroke-linecap='round' stroke-linejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' /></svg>`
    const rightArrowSVG = `<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-6 h-6'> <path stroke-linecap='round' stroke-linejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' /> </svg>`;

    slideshowBtns.forEach((btn)=>{
        btn.style.textAlign = 'center';

        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.justifyContent = 'center';
        btn.style.alignItems = 'center';

        const arrow = document.createElement('div');
        btn.appendChild(arrow);

        arrow.classList.add('slideshow-arrow');
        arrow.style.width = '100%';
        arrow.style.maxWidth = '40px'
        arrow.style.height = '60px';
        arrow.style.backgroundColor = defaultColor;
        arrow.style.display = 'flex';
        arrow.style.flexDirection = 'column';
        arrow.style.justifyContent = 'center';
        arrow.style.alignItems = 'center';
        arrow.style.borderRadius = '5px';
        arrow.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
        arrow.style.transition = 'background-color 0.2s, opacity 0.2s';
    });

    leftBtn.querySelector('.slideshow-arrow').innerHTML = leftArrowSVG;
    rightBtn.querySelector('.slideshow-arrow').innerHTML = rightArrowSVG;


    const pageNumber = document.createElement('div');
    pageNumber.classList.add('slideshow-page-number');
    pageNumber.style.marginBottom = '10px';
    slideshow.appendChild(pageNumber);
    slideshow.style.width = '100%';
    slideshow.style.fontSize = '0.8rem';
    slideshow.style.marginTop = '10px';

    slides.forEach((slide, index)=>{
        const page = document.createElement('div');
        page.style.width = '100%';
        page.style.display = 'none';
        page.style.textAlign = 'center';
        page.style.fontSize = '1rem';

        const className = `page-${index}`;
        page.classList.add('pages');
        page.classList.add(className);

        if( mode === 'image' ){
            const img = document.createElement('img');
            const imagePage = `${imagePath}/${slide}`;
            img.src = imagePage;
            img.style.width = '100%';

            if( !(imageClassName === null || imageClassName === undefined) ){
                const imgClassNames = imageClassName.split(' ');
                imgClassNames.forEach((cls)=>{
                    img.classList.add(cls);
                });
            }
            page.appendChild(img);
        }

        if( mode === 'html' ){
            const txtDiv = document.createElement('div');
            txtDiv.classList.add('slide-text-page');
            txtDiv.style.width = '100%';
            txtDiv.style.padding = '5px';
            txtDiv.style.wordBreak = 'keep-all'
            txtDiv.style.minHeight = '200px';
            txtDiv.style.display = 'flex';
            txtDiv.style.fontSize = '1.3rem';
            txtDiv.style.justifyContent = 'center';
            txtDiv.style.alignItems = 'center';

            const txt = document.createElement('div');
            txt.classList.add('slide-text');
            txt.innerHTML = slide;
            txt.style.padding = '20px';
            txtDiv.appendChild(txt);
            page.appendChild(txtDiv);
        }

        slideshow.appendChild(page);
    });

    /* Make slide show dot */
    const dotList = document.createElement('div');
    dotList.classList.add('dot-list');
    slideshow.appendChild(dotList);
    dotList.style.width = '100%';
    dotList.style.display = 'flex';
    dotList.style.justifyContent = 'center';
    dotList.style.alignItems = 'center';
    dotList.style.gap = '10px';
    dotList.style.marginTop = '10px';

    slides.forEach((page, index)=>{
        const dot = document.createElement('div');
        const dotClassName = `slide-show-dot-${index}`;
        dot.classList.add('slide-show-dot');
        dot.classList.add(dotClassName);
        dot.style.width = '10px';
        dot.style.height = '10px';
        dot.style.backgroundColor = dotColor;
        dot.style.borderRadius = '100%';
        dot.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
        dot.style.transition = 'background-color 0.2s';
        dot.style.cursor = 'pointer';
        dot.dataset.page = index;
        dotList.appendChild(dot);
    });

    const forceTextDiv = document.createElement('div');
    forceTextDiv.innerHTML = forceText;
    forceTextDiv.style.width = '100%';
    forceTextDiv.style.marginTop = '20px';
    forceTextDiv.style.color = '#e7046f';
    forceTextDiv.style.textAlign = 'center';
    forceTextDiv.style.display = 'none';
    forceTextDiv.style.fontSize = '1.2rem';
    forceTextDiv.classList.add('force-text');
    slideshow.appendChild(forceTextDiv);


    /* Slide show handlers */
    let pageIndex = 0;
    let slideComplete = false;

    const pageHandler = (calcNum)=>{
        if( calcNum === null || calcNum === undefined ){
            return
        }
        const lastPageIndex = slides.length - 1;
        pageIndex = calcNum;
        if(force){
            rightBtn.addEventListener('click', () => {
                if(holdPageSec > 0) { // holdPageSec가 0보다 클 때만 작동
                    if((pageIndex !== lastPageIndex) && (!slideComplete)){
                        rightBtn.style.opacity = '0.5';
                        rightBtn.style.pointerEvents = 'none';
                        
                        // holdPageSec 만큼의 시간이 지난 후에 스타일 해제
                        setTimeout(() => {
                            rightBtn.style.opacity = '';
                            rightBtn.style.pointerEvents = '';
                        }, holdPageSec * 1000); // milliseconds로 변환
                    }else{
                        slideComplete = true;
                    }
                }
            });

            if(pageIndex === lastPageIndex){
                leftBtn.style.pointerEvents = '';
                const leftArrow = leftBtn.querySelector('.slideshow-arrow');
                leftArrow.style.display = 'flex';

                dotList.style.pointerEvents = '';
                forceTextDiv.classList.add('animate__animated');
                forceTextDiv.classList.add('animate__flipOutX');
                
                const nextBtn = document.querySelector(forceSwitch);
                nextBtn.disabled = false;
            }
        }

        if( pageIndex < 0 ){
            pageIndex = lastPageIndex;
        }
        else if( pageIndex > lastPageIndex ){
            pageIndex = 0;
        }
        
        /* page control */
        const pages = document.querySelectorAll('.pages');
        pages.forEach((page)=>{
            page.style.display = 'none';
        });
        const showClassName = `.page-${pageIndex}`;
        const showPage = document.querySelector(showClassName);
        showPage.style.display = 'block';

        const showPageNumber = document.querySelector('.slideshow-page-number');
        const pageText = `${pageIndex+1}/${slides.length}`;
        showPageNumber.innerHTML = pageText;

        /* dot control */
        const dots = document.querySelectorAll('.slide-show-dot');
        dots.forEach((dot)=>{ dot.style.backgroundColor = dotColor });
        const activeDot = document.querySelector(`.slide-show-dot-${pageIndex}`);
        activeDot.style.backgroundColor = activeColor;
    }
    pageHandler(pageIndex);

    const dotHandler = (e)=>{
        const pageNumber = e.target.dataset.page;
        if( pageNumber === null || pageNumber === undefined){
            return;
        }
        pageIndex = Number(pageNumber);
        pageHandler(pageIndex);
    }

    const btnMouseOver = (curr)=>{
        const arrow = curr.querySelector('.slideshow-arrow');
        if( arrow === null || arrow === undefined ){
            return
        }
        arrow.style.backgroundColor = activeColor;
        arrow.style.color = activeFontColor;
    }

    const btnMouseLeave = (curr)=>{
        const arrow = curr.querySelector('.slideshow-arrow');
        if( arrow === null || arrow === undefined ){
            return
        }
        arrow.style.backgroundColor = defaultColor;
        arrow.style.color = defaultFontColor;
    }

    /* force control */
    if(force){
        leftBtn.style.pointerEvents = 'none';
        const leftArrow = leftBtn.querySelector('.slideshow-arrow');
        leftArrow.style.display = 'none';

        dotList.style.pointerEvents = 'none';
        forceTextDiv.style.display = 'block';

        const nextBtn = document.querySelector(forceSwitch);
        nextBtn.disabled = true;

    }

    leftBtn.addEventListener('click', ()=>{
        pageHandler(pageIndex - 1);
    });
    rightBtn.addEventListener('click', ()=>{
        pageHandler(pageIndex + 1);
    });

    [leftBtn, rightBtn].forEach((btn)=>{
        btn.style.cursor = 'pointer';
        btn.addEventListener('mouseover',  ()=>{btnMouseOver(btn);});
        btn.addEventListener('mouseleave', ()=>{btnMouseLeave(btn);});
    })

    dotList.addEventListener('click', dotHandler);
};


function floatHandler(query, validNumber){
    const floats = document.querySelectorAll('.float-base');
    [...floats].forEach((float)=>{
        float.addEventListener('keyup', (event)=>{
            const currValue = event.target.value;
            if( currValue !== null && currValue !== undefined && currValue !== ''){
                if( currValue.indexOf('.') > 0 ){
                    const splitValue = currValue.split('.')
                    const floatValue = splitValue[1];
                    if( floatValue.length>validNumber ) {
                        event.preventDefault();
                        const diffValue = floatValue.substring(0, validNumber);
                        float.value = parseFloat(`${splitValue[0]}.${diffValue}`);
                    }
                }
            }
        });
    });
}

function fnLengthCheck(_label, _num, _placeholder){
  const fnNextActivate = (_bol) => {
    const objNextBtn = document.getElementById('btn_continue');
    if (_bol){
      objNextBtn.disabled = false;
    }
    else{
      objNextBtn.disabled = true;
    }
  }
  
  const fnBadText = (_obj) => {
    let strBeforeText = _obj.value;
    let strAfterText;
    strBeforeText = strBeforeText.replace(/\n\n\n\n\n\n\n\n\n\n|\n\n\n\n\n\n\n\n\n|\n\n\n\n\n\n\n\n|\n\n\n\n\n\n\n|\n\n\n\n\n\n|\n\n\n\n\n|\n\n\n\n|\n\n\n|\n\n/g, '\n');
    strBeforeText = strBeforeText.replace(/\.\.\.\.\.\.\.\.\.\.|\.\.\.\.\.\.\.\.\.|\.\.\.\.\.\.\.\.|\.\.\.\.\.\.\.|\.\.\.\.\.\.|\.\.\.\.\.|\.\.\.\.|\.\.\.|\.\./g, '\.');
    strBeforeText = strBeforeText.replace(/\~\~\~\~\~\~\~\~\~\~|\~\~\~\~\~\~\~\~\~|\~\~\~\~\~\~\~\~|\~\~\~\~\~\~\~|\~\~\~\~\~\~|\~\~\~\~\~|\~\~\~\~|\~\~\~|\~\~/g, '\~');
    strBeforeText = strBeforeText.replace(/\?\?\?\?\?\?\?\?\?\?|\?\?\?\?\?\?\?\?\?|\?\?\?\?\?\?\?\?|\?\?\?\?\?\?\?|\?\?\?\?\?\?|\?\?\?\?\?|\?\?\?\?|\?\?\?|\?\?/g, '\?');
    strBeforeText = strBeforeText.replace(/\(\(\(\(\(\(\(\(\(\(|\(\(\(\(\(\(\(\(\(|\(\(\(\(\(\(\(\(|\(\(\(\(\(\(\(|\(\(\(\(\(\(|\(\(\(\(\(|\(\(\(\(|\(\(\(|\(\(/g, '\(');
    strBeforeText = strBeforeText.replace(/\)\)\)\)\)\)\)\)\)\)|\)\)\)\)\)\)\)\)\)|\)\)\)\)\)\)\)\)|\)\)\)\)\)\)\)|\)\)\)\)\)\)|\)\)\)\)\)|\)\)\)\)|\)\)\)|\)\)/g, '\)');
    strBeforeText = strBeforeText.replace(/\/\/\/\/\/\/\/\/\/\/|\/\/\/\/\/\/\/\/\/|\/\/\/\/\/\/\/\/|\/\/\/\/\/\/\/|\/\/\/\/\/\/|\/\/\/\/\/|\/\/\/\/|\/\/\/|\/\//g, '\/');
    strBeforeText = strBeforeText.replace(/\+\+\+\+\+\+\+\+\+\+|\+\+\+\+\+\+\+\+\+|\+\+\+\+\+\+\+\+|\+\+\+\+\+\+\+|\+\+\+\+\+\+|\+\+\+\+\+|\+\+\+\+|\+\+\+|\+\+/g, '\+');
    strBeforeText = strBeforeText.replace(/ㆍㆍㆍㆍㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍ|ㆍㆍㆍ|ㆍㆍ/g, 'ㆍ');
    strBeforeText = strBeforeText.replace(/ᆢᆢᆢᆢᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢ|ᆢᆢᆢ|ᆢᆢ/g, 'ᆢ');
    strBeforeText = strBeforeText.replace(/          |         |        |       |      |     |    |   |  /g, ' ');
    strBeforeText = strBeforeText.replace(/!!!!!!!!!!|!!!!!!!!!|!!!!!!!!|!!!!!!!|!!!!!!|!!!!!|!!!!|!!!|!!/g, '!');
    strBeforeText = strBeforeText.replace(/,,,,,,,,,,|,,,,,,,,,|,,,,,,,,|,,,,,,,|,,,,,,|,,,,,|,,,,|,,,|,,/g, ',');
    strBeforeText = strBeforeText.replace(/::::::::::|:::::::::|::::::::|:::::::|::::::|:::::|::::|:::|::/g, ':');
    strBeforeText = strBeforeText.replace(/''''''''''|'''''''''|''''''''|'''''''|''''''|'''''|''''|'''|''/g, "'");
    strBeforeText = strBeforeText.replace(/""""""""""|"""""""""|""""""""|"""""""|""""""|"""""|""""|"""|""/g, '"');
    strBeforeText = strBeforeText.replace(/{{{{{{{{{{|{{{{{{{{{|{{{{{{{{|{{{{{{{|{{{{{{|{{{{{|{{{{|{{{|{{/g, '{');
    strBeforeText = strBeforeText.replace(/}}}}}}}}}}|}}}}}}}}}|}}}}}}}}|}}}}}}}|}}}}}}|}}}}}|}}}}|}}}|}}/g, '}');
    strBeforeText = strBeforeText.replace(/<<<<<<<<<<|<<<<<<<<<|<<<<<<<<|<<<<<<<|<<<<<<|<<<<<|<<<<|<<<|<</g, '<');
    strBeforeText = strBeforeText.replace(/>>>>>>>>>>|>>>>>>>>>|>>>>>>>>|>>>>>>>|>>>>>>|>>>>>|>>>>|>>>|>>/g, '>');
    strBeforeText = strBeforeText.replace(/----------|---------|--------|-------|------|-----|----|---|--/g, '-');
    strBeforeText = strBeforeText.replace(/__________|_________|________|_______|______|_____|____|___|__/g, '_');
    strBeforeText = strBeforeText.replace(/==========|=========|========|=======|======|=====|====|===|==/g, '=');
    strBeforeText = strBeforeText.replace(/ㆍᆢ/g, 'ㆍ');
    strBeforeText = strBeforeText.replace(/ᆢㆍ/g, 'ᆢ');
    strBeforeText = strBeforeText.replace(/\n /g, '\n');
    strBeforeText = strBeforeText.replace(/`|@|#|\$|%|\^|&|\*|\\|\||;|♡|♥|§|×|÷|♤|♠|☆|♧|♣|$|€|£|¥|°|○|●|□|■|◇|※|《|》|¤|¡|¿|＃|＆|＊|＠|★|◎|◆|△|▲|▽|▼|→|←|↑|↓|↔|〓|◁|◀|▷|▶|⊙|◈|▣|◐|◑|▒|▤|▥|▨|▧|▦|▩|♨|☏|☎|☜|☞|¶|†|‡|↕|↗|↙|↖|↘|♭|♩|♪|♬|㉿|㈜|№|㏇|™|㏂|㏘|℡|®|ª|º|㉾/g, '');
    if(strBeforeText.charAt(0) === ' '){
      strBeforeText = strBeforeText.slice(1);
    }
    if(strBeforeText.charAt(0) === '\n'){
      strBeforeText = strBeforeText.slice(1);
    }
    _obj.value = strBeforeText;
    if (_obj.tagName === 'TEXTAREA'){
      strAfterText = strBeforeText.replace(/\n/g, '');
      if (strAfterText.charAt(strAfterText.length - 1) === ' '){
        return strAfterText.length - 1;
      }
      else{
        return strAfterText.length;
      }
    }
  }
  
  const fnFilltering = (_obj) => {
    let strMainText = _obj.value;
    let strFillteringWord = 'ㄱ,ㄲ,ㄴ,ㄷ,ㄸ,ㄹ,ㅁ,ㅂ,ㅃ,ㅅ,ㅆ,ㅇ,ㅈ,ㅉ,ㅊ,ㅋ,ㅌ,ㅍ,ㅎ,ㅏ,ㅐ,ㅑ,ㅒ,ㅓ,ㅔ,ㅕ,ㅖ,ㅗ,ㅘ,ㅙ,ㅚ,ㅛ,ㅜ,ㅝ,ㅞ,ㅟ,ㅠ,ㅡ,ㅢ,ㅣ,ㄳ,ㄵ,ㄶ,ㄺ,ㄻ,ㄼ,ㄽ,ㄾ,ㄿ,ㅀ,ㅄ,ㆍ,ᆢ';
    for (i = 0; i < strFillteringWord.split(',').length; i++){
      strMainText = strMainText.replaceAll(strFillteringWord.split(',')[i], '');
    }
    while (strMainText.charAt(strMainText.length - 1) === '\n' || strMainText.charAt(strMainText.length - 1) === ' '){
      strMainText = strMainText.slice(0, strMainText.length - 1);
    }
    if (_obj.tagName === 'TEXTAREA'){
      if (!isNaN(strMainText)){
        strMainText = '';
      }
    }
    _obj.value = strMainText;
    if (_obj.tagName === 'TEXTAREA'){
      fnInputCheck();
    }
  }
  
  const fnInputCheck = () => {
    for (i = 0; i < document.querySelectorAll(`#question_${_label} .areaCheck`).length; i++){
      let numCheckLength = Number(`${_num}`);
      let changeTextArea = document.querySelectorAll(`#question_${_label} .areaCheck textarea`)[i];
      let changeAreaWrap = changeTextArea.parentNode;
      let changeAreaGageOutLine = changeAreaWrap.querySelector('.areaGageOutLine');
      let changePassView = changeAreaWrap.querySelector('.areaPassView');
      let changeFailView = changeAreaWrap.querySelector('.areaFailView');
      let changeAreaGageInnerLine = changeAreaWrap.querySelector('.areaGageInnerLine');
      let numCalcLength = fnBadText(changeTextArea);

      if (changeTextArea.getAttribute('disabled') !== null){
        numCheckLength = 0;
      }
      let numConvertPer = Math.floor(numCalcLength / numCheckLength * 100);

      let numLowRed = 230;
      let numLowGreen = 21;
      let numLowBlue = 33;

      let numMiddleRed = 153;
      let numMiddleGreen = 112;
      let numMiddleBlue = 181;

      let numHighRed = 45;
      let numHighGreen = 109;
      let numHighBlue = 246;

      if(numCalcLength >= numCheckLength){
        changeAreaGageOutLine.style.borderColor = 'rgb(' + numHighRed + ', ' + numHighGreen + ', ' + numHighBlue + ')';
        changeAreaGageInnerLine.style.backgroundColor = 'rgb(' + numHighRed + ', ' + numHighGreen + ', ' + numHighBlue + ')';
        changeAreaGageInnerLine.style.width = '100%';
        changeAreaGageInnerLine.style.borderRadius = '6px';
        changeAreaWrap.classList.add('checkPass');
        changePassView.style.opacity = '1';
        changeFailView.style.opacity = '0';
      }
      else{
        let numCalcRed = (numLowRed - numHighRed) * ((100 - numConvertPer) / 100) + numHighRed;
        let numCalcGreen = (numLowGreen - numHighGreen) * ((100 - numConvertPer) / 100) + numHighGreen;
        let numCalcBlue = (numLowBlue - numHighBlue) * ((100 - numConvertPer) / 100) + numHighBlue;
        if (numConvertPer <= 50){
          numCalcRed = (numLowRed - numMiddleRed) * ((100 - (numConvertPer * 2)) / 100) + numMiddleRed;
          numCalcGreen = (numLowGreen - numMiddleGreen) * ((100 - (numConvertPer * 2)) / 100) + numMiddleGreen;
          numCalcBlue = (numLowBlue - numMiddleBlue) * ((100 - (numConvertPer * 2)) / 100) + numMiddleBlue;
        }
        else {
          numCalcRed = (numMiddleRed - numHighRed) * ((100 - numConvertPer) / 100 * 2) + numHighRed;
          numCalcGreen = (numMiddleGreen - numHighGreen) * ((100 - numConvertPer) / 100 * 2) + numHighGreen;
          numCalcBlue = (numMiddleBlue - numHighBlue) * ((100 - numConvertPer) / 100 * 2) + numHighBlue;
        }
        changeAreaGageInnerLine.style.width = numConvertPer + '%';
        changeAreaGageInnerLine.style.borderTopRightRadius = Math.round(6 * (numConvertPer / 100)) + 'px';
        changeAreaGageInnerLine.style.borderBottomRightRadius = Math.round(6 * (numConvertPer / 100)) + 'px';
        changePassView.style.opacity = '0';
        changeFailView.style.opacity = '1';
        changeAreaWrap.classList.remove('checkPass');
        changeAreaGageOutLine.style.borderColor = 'rgb(' + numCalcRed + ', ' + numCalcGreen + ', ' + numCalcBlue + ')';
        changeAreaGageInnerLine.style.backgroundColor = 'rgb(' + numCalcRed + ', ' + numCalcGreen + ', ' + numCalcBlue + ')';  
      }
    }
    fnPassCheck();
  }
  
  const fnPassCheck = () => {
    let numPassCount = 0;
    for (i = 0; i < document.querySelectorAll('#primary .areaCheck').length; i++){
      if (document.querySelectorAll('#primary .areaCheck')[i].getAttribute('class').indexOf('checkPass') !== -1){
        numPassCount++;
      }
    }
    numPassCount === document.querySelectorAll('#primary .areaCheck').length ? fnNextActivate(true) : fnNextActivate(false);
  }

  let numTextAreaCount = document.querySelectorAll(`#question_${_label} textarea`).length;
  let numInputTextCount = document.querySelectorAll(`#question_${_label} input[type=text]`).length;

  if (numTextAreaCount > 0){
    for(i = 0; i < numTextAreaCount; i++){
      let objTextArea = document.querySelectorAll(`#question_${_label} textarea`)[i];
      let objAreaWrap = document.createElement('span');
      let objSection = document.createElement('div');
      let objAreaGageOutLineShield = document.createElement('div');
      let objAreaGageOutLine = document.createElement('div');
      let objAreaGageInnerLine = document.createElement('div');
      let objMarkPassArea = document.createElement('span');
      let objMarkFailArea = document.createElement('span');
      let objMarkPassLeftView = document.createElement('div');
      let objMarkPassBottomView = document.createElement('div');
      let objMarkFailLeftView = document.createElement('div');
      let objMarkFailRightView = document.createElement('div');
      let objMarkFailLeftRect = document.createElement('div');
      let objMarkFailRightRect = document.createElement('div');
  
      objAreaWrap.classList.add('areaCheck');
      objAreaWrap.style.display = 'inline-block';
      
      objAreaGageOutLine.classList.add('areaGageOutLine');
      objAreaGageOutLine.style.width = 'calc(100% - 20px)';
      objAreaGageOutLine.style.height = '14px';
      objAreaGageOutLine.style.border = 'solid 2px rgb(230, 21, 33)';
      objAreaGageOutLine.style.borderRadius = '10px';
      objAreaGageOutLine.style.transitionDuration = '0.15s';

      objAreaGageOutLineShield.classList.add('areaGageOutLineShield');
      objAreaGageOutLineShield.style.position = 'relative';
      objAreaGageOutLineShield.style.width = 'calc(100% + 2px)';
      objAreaGageOutLineShield.style.height = 'calc(100% + 2px)';
      objAreaGageOutLineShield.style.borderRadius = '10px';
      objAreaGageOutLineShield.style.left = '-1px';
      objAreaGageOutLineShield.style.top = '-1px';
      objAreaGageOutLineShield.style.overflow = 'hidden';
    
      objAreaGageInnerLine.classList.add('areaGageInnerLine');
      objAreaGageInnerLine.style.position = 'relative';
      objAreaGageInnerLine.style.width = '0%';
      objAreaGageInnerLine.style.height = '100%';
      objAreaGageInnerLine.style.backgroundColor = 'rgb(230, 21, 33)';
      objAreaGageInnerLine.style.borderTopLeftRadius = '6px';
      objAreaGageInnerLine.style.borderBottomLeftRadius = '6px';
      objAreaGageInnerLine.style.borderTopRightRadius = '0px';
      objAreaGageInnerLine.style.borderBottomRightRadius = '0px';
      objAreaGageInnerLine.style.transitionDuration = '0.15s';
    
      objMarkPassArea.classList.add('areaPassView')
      objMarkPassArea.style.position = 'absolute';
      objMarkPassArea.style.display = 'block';
      objMarkPassArea.style.right = '0px';
      objMarkPassArea.style.top = '0px';
      objMarkPassArea.style.width = '14px';
      objMarkPassArea.style.height = '14px';
      objMarkPassArea.style.transform = 'translateZ(0px)';
      objMarkPassArea.style.border = 'solid 2px rgb(45, 109, 246)';
      objMarkPassArea.style.borderRadius = '100%';
      objMarkPassArea.style.opacity = '0';
      objMarkPassArea.style.overflow = 'hidden';
      objMarkPassArea.style.transitionDuration = '0.2s';
    
      objMarkPassLeftView.style.position = 'absolute';
      objMarkPassLeftView.style.display = 'block';
      objMarkPassLeftView.style.width = '8px';
      objMarkPassLeftView.style.height = '4px';
      objMarkPassLeftView.style.left = '1px';
      objMarkPassLeftView.style.top = '2px';
      objMarkPassLeftView.style.borderLeftWidth = '2px';
      objMarkPassLeftView.style.borderLeftStyle = 'solid';
      objMarkPassLeftView.style.borderLeftColor = 'rgb(45, 109, 246)';
      objMarkPassLeftView.style.transform = 'rotate(-45deg)';

      objMarkPassBottomView.style.position = 'absolute';
      objMarkPassBottomView.style.display = 'block';
      objMarkPassBottomView.style.width = '8px';
      objMarkPassBottomView.style.height = '4px';
      objMarkPassBottomView.style.left = '1px';
      objMarkPassBottomView.style.top = '2px';
      objMarkPassBottomView.style.borderBottomWidth = '2px';
      objMarkPassBottomView.style.borderBottomStyle = 'solid';
      objMarkPassBottomView.style.borderBottomColor = 'rgb(45, 109, 246)';
      objMarkPassBottomView.style.transform = 'rotate(-45deg)';
    
      objMarkFailArea.classList.add('areaFailView')
      objMarkFailArea.style.position = 'absolute';
      objMarkFailArea.style.display = 'block';
      objMarkFailArea.style.right = '0px';
      objMarkFailArea.style.top = '0px';
      objMarkFailArea.style.width = '14px';
      objMarkFailArea.style.height = '14px';
      objMarkFailArea.style.transform = 'translateZ(0px)';
      objMarkFailArea.style.border = 'solid 2px rgb(230, 21, 33)';
      objMarkFailArea.style.borderRadius = '100%';
      objMarkFailArea.style.opacity = '1';
      objMarkFailArea.style.overflow = 'hidden';
      objMarkFailArea.style.transitionDuration = '0.2s';
    
      objMarkFailLeftView.style.position = 'absolute';
      objMarkFailLeftView.style.display = 'block';
      objMarkFailLeftView.style.width = '100%';
      objMarkFailLeftView.style.height = '100%';
      objMarkFailLeftView.style.transform = 'rotate(-45deg)';
  
      objMarkFailLeftRect.style.position = 'absolute';
      objMarkFailLeftRect.style.display = 'block';
      objMarkFailLeftRect.style.width = '2px';
      objMarkFailLeftRect.style.height = 'calc(100% - 2px)';
      objMarkFailLeftRect.style.left = '50%';
      objMarkFailLeftRect.style.top = '50%';
      objMarkFailLeftRect.style.transform = 'translate(-50%, -50%)';
      objMarkFailLeftRect.style.backgroundColor = 'rgb(230, 21, 33)';
    
      objMarkFailRightView.style.position = 'absolute';
      objMarkFailRightView.style.display = 'block';
      objMarkFailRightView.style.width = '100%';
      objMarkFailRightView.style.height = '100%';
      objMarkFailRightView.style.transform = 'rotate(45deg)';
  
      objMarkFailRightRect.style.position = 'absolute';
      objMarkFailRightRect.style.display = 'block';
      objMarkFailRightRect.style.width = '2px';
      objMarkFailRightRect.style.height = 'calc(100% - 2px)';
      objMarkFailRightRect.style.left = '50%';
      objMarkFailRightRect.style.top = '50%';
      objMarkFailRightRect.style.transform = 'translate(-50%, -50%)';
      objMarkFailRightRect.style.backgroundColor = 'rgb(230, 21, 33)';
    
      objSection.classList.add('wrapSection');
      objSection.style.position = 'relative';
      objSection.style.marginTop = '5px';
      _num > 0 ? objSection.style.display = 'block' : objSection.style.display = 'none';
    
      objTextArea.after(objAreaWrap);
      objAreaWrap.append(document.querySelectorAll(`#question_${_label} textarea`)[i]);
      objAreaGageOutLineShield.append(objAreaGageInnerLine);
      objMarkFailLeftView.append(objMarkFailLeftRect);
      objMarkFailRightView.append(objMarkFailRightRect);
      objMarkPassArea.append(objMarkPassLeftView);
      objMarkPassArea.append(objMarkPassBottomView);
      objMarkFailArea.append(objMarkFailLeftView);
      objMarkFailArea.append(objMarkFailRightView);
      objAreaGageOutLine.append(objAreaGageOutLineShield);
      objSection.append(objAreaGageOutLine);
      objSection.append(objMarkPassArea);
      objSection.append(objMarkFailArea);
      objAreaWrap.append(objSection);
    
      if (!(_placeholder === undefined || _placeholder === 'undefined' || _placeholder === 'None' || _placeholder === 'none' || _placeholder === '0' || _placeholder === '')){
        objTextArea.setAttribute('placeholder', _placeholder)
      }

      jQuery(objTextArea).on("propertychange change keyup paste input focus", fnInputCheck);
    
      objTextArea.addEventListener('blur', () => {
        fnInputCheck();
        fnFilltering(objTextArea);
      });
    }
    fnInputCheck();
    document.getElementById('btn_continue').addEventListener('mouseover', fnInputCheck);
  }
  if (numInputTextCount > 0){
    for (k = 0; k < numInputTextCount; k++){
      if (document.querySelectorAll(`#question_${_label} input[type=text]`)[k].getAttribute('name') !== null && document.querySelectorAll(`#question_${_label} input[type=text]`)[k].getAttribute('name').indexOf('ans') !== -1){
        let objInputText = document.querySelectorAll(`#question_${_label} input[type=text]`)[k];
        if (!(_placeholder === undefined || _placeholder === 'undefined' || _placeholder === 'None' || _placeholder === 'none' || _placeholder === '0' || _placeholder === '')){
          objInputText.setAttribute('placeholder', _placeholder)
        }
        jQuery(objInputText).on("propertychange change keyup paste input focus", () => {
          fnBadText(objInputText);
        });
        objInputText.addEventListener('blur', () => {
          fnFilltering(objInputText);
        });
      }
    }
  }
}

function fnViewPort(_max){
  var strMin = "1";
  var strMax = (_max === undefined || isNaN(_max) || _max < 1) ? "3" : String(_max);
  for (var meta of document.querySelectorAll('head meta')){
    if (meta.getAttribute('name') !== null && meta.getAttribute('name') === 'viewport'){
      meta.setAttribute('content', 'width=device-width, initial-scale=' + strMin + ', maximum-scale=' + strMax);
      break;
    }
  }
}

function fnSemiOpenBadText(){
  const fnOpenFilltering = (_obj) => {
    if (_obj.getAttribute('type') === 'text' && !_obj.disabled){
      let strMainText = _obj.value;
      let bolFlag = false;
      let strFillteringWord = 'ㄱ,ㄲ,ㄴ,ㄷ,ㄸ,ㄹ,ㅁ,ㅂ,ㅃ,ㅅ,ㅆ,ㅇ,ㅈ,ㅉ,ㅊ,ㅋ,ㅌ,ㅍ,ㅎ,ㅏ,ㅐ,ㅑ,ㅒ,ㅓ,ㅔ,ㅕ,ㅖ,ㅗ,ㅘ,ㅙ,ㅚ,ㅛ,ㅜ,ㅝ,ㅞ,ㅟ,ㅠ,ㅡ,ㅢ,ㅣ,ㄳ,ㄵ,ㄶ,ㄺ,ㄻ,ㄼ,ㄽ,ㄾ,ㄿ,ㅀ,ㅄ,ㆍ,ᆢ';
      for(i = 0; i < strFillteringWord.split(',').length; i++){
        if(strMainText.indexOf(strFillteringWord.split(',')[i]) !== -1){
          bolFlag = true;
          break;
        }
      }
      if(bolFlag){
        let strTempText = strMainText;
        for (i = 0; i < strFillteringWord.split(',').length; i++){
          if(strMainText.indexOf(strFillteringWord.split(',')[i]) !== -1){
            strTempText = strTempText.replaceAll(strFillteringWord.split(',')[i], '');
          }
        }
        if(strTempText.length <= 0){
          for (i = 0; i < strFillteringWord.split(',').length; i++){
            strMainText = strMainText.replaceAll(strFillteringWord.split(',')[i], '');
          }
        }
      }
      while (strMainText.charAt(strMainText.length - 1) === '\n' || strMainText.charAt(strMainText.length - 1) === ' '){
        strMainText = strMainText.slice(0, strMainText.length - 1);
      }
      _obj.value = strMainText;
      fnOpenCheck(_obj);
    }
  }
  const fnOpenCheck = (_obj) => {
    if (_obj.getAttribute('type') === 'text' && !_obj.disabled){
      let strBeforeText = _obj.value;
      let strAfterText;
      strBeforeText = strBeforeText.replace(/\n\n\n\n\n\n\n\n\n\n|\n\n\n\n\n\n\n\n\n|\n\n\n\n\n\n\n\n|\n\n\n\n\n\n\n|\n\n\n\n\n\n|\n\n\n\n\n|\n\n\n\n|\n\n\n|\n\n/g, '\n');
      strBeforeText = strBeforeText.replace(/\.\.\.\.\.\.\.\.\.\.|\.\.\.\.\.\.\.\.\.|\.\.\.\.\.\.\.\.|\.\.\.\.\.\.\.|\.\.\.\.\.\.|\.\.\.\.\.|\.\.\.\.|\.\.\.|\.\./g, '\.');
      strBeforeText = strBeforeText.replace(/\~\~\~\~\~\~\~\~\~\~|\~\~\~\~\~\~\~\~\~|\~\~\~\~\~\~\~\~|\~\~\~\~\~\~\~|\~\~\~\~\~\~|\~\~\~\~\~|\~\~\~\~|\~\~\~|\~\~/g, '\~');
      strBeforeText = strBeforeText.replace(/\?\?\?\?\?\?\?\?\?\?|\?\?\?\?\?\?\?\?\?|\?\?\?\?\?\?\?\?|\?\?\?\?\?\?\?|\?\?\?\?\?\?|\?\?\?\?\?|\?\?\?\?|\?\?\?|\?\?/g, '\?');
      strBeforeText = strBeforeText.replace(/\(\(\(\(\(\(\(\(\(\(|\(\(\(\(\(\(\(\(\(|\(\(\(\(\(\(\(\(|\(\(\(\(\(\(\(|\(\(\(\(\(\(|\(\(\(\(\(|\(\(\(\(|\(\(\(|\(\(/g, '\(');
      strBeforeText = strBeforeText.replace(/\)\)\)\)\)\)\)\)\)\)|\)\)\)\)\)\)\)\)\)|\)\)\)\)\)\)\)\)|\)\)\)\)\)\)\)|\)\)\)\)\)\)|\)\)\)\)\)|\)\)\)\)|\)\)\)|\)\)/g, '\)');
      strBeforeText = strBeforeText.replace(/\/\/\/\/\/\/\/\/\/\/|\/\/\/\/\/\/\/\/\/|\/\/\/\/\/\/\/\/|\/\/\/\/\/\/\/|\/\/\/\/\/\/|\/\/\/\/\/|\/\/\/\/|\/\/\/|\/\//g, '\/');
      strBeforeText = strBeforeText.replace(/\+\+\+\+\+\+\+\+\+\+|\+\+\+\+\+\+\+\+\+|\+\+\+\+\+\+\+\+|\+\+\+\+\+\+\+|\+\+\+\+\+\+|\+\+\+\+\+|\+\+\+\+|\+\+\+|\+\+/g, '\+');
      strBeforeText = strBeforeText.replace(/ㆍㆍㆍㆍㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍㆍ|ㆍㆍㆍㆍ|ㆍㆍㆍ|ㆍㆍ/g, 'ㆍ');
      strBeforeText = strBeforeText.replace(/ᆢᆢᆢᆢᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢᆢ|ᆢᆢᆢᆢ|ᆢᆢᆢ|ᆢᆢ/g, 'ᆢ');
      strBeforeText = strBeforeText.replace(/          |         |        |       |      |     |    |   |  /g, ' ');
      strBeforeText = strBeforeText.replace(/!!!!!!!!!!|!!!!!!!!!|!!!!!!!!|!!!!!!!|!!!!!!|!!!!!|!!!!|!!!|!!/g, '!');
      strBeforeText = strBeforeText.replace(/,,,,,,,,,,|,,,,,,,,,|,,,,,,,,|,,,,,,,|,,,,,,|,,,,,|,,,,|,,,|,,/g, ',');
      strBeforeText = strBeforeText.replace(/::::::::::|:::::::::|::::::::|:::::::|::::::|:::::|::::|:::|::/g, ':');
      strBeforeText = strBeforeText.replace(/''''''''''|'''''''''|''''''''|'''''''|''''''|'''''|''''|'''|''/g, "'");
      strBeforeText = strBeforeText.replace(/""""""""""|"""""""""|""""""""|"""""""|""""""|"""""|""""|"""|""/g, '"');
      strBeforeText = strBeforeText.replace(/{{{{{{{{{{|{{{{{{{{{|{{{{{{{{|{{{{{{{|{{{{{{|{{{{{|{{{{|{{{|{{/g, '{');
      strBeforeText = strBeforeText.replace(/}}}}}}}}}}|}}}}}}}}}|}}}}}}}}|}}}}}}}|}}}}}}|}}}}}|}}}}|}}}|}}/g, '}');
      strBeforeText = strBeforeText.replace(/<<<<<<<<<<|<<<<<<<<<|<<<<<<<<|<<<<<<<|<<<<<<|<<<<<|<<<<|<<<|<</g, '<');
      strBeforeText = strBeforeText.replace(/>>>>>>>>>>|>>>>>>>>>|>>>>>>>>|>>>>>>>|>>>>>>|>>>>>|>>>>|>>>|>>/g, '>');
      strBeforeText = strBeforeText.replace(/----------|---------|--------|-------|------|-----|----|---|--/g, '-');
      strBeforeText = strBeforeText.replace(/__________|_________|________|_______|______|_____|____|___|__/g, '_');
      strBeforeText = strBeforeText.replace(/==========|=========|========|=======|======|=====|====|===|==/g, '=');
      strBeforeText = strBeforeText.replace(/ㆍᆢ/g, 'ㆍ');
      strBeforeText = strBeforeText.replace(/ᆢㆍ/g, 'ᆢ');
      strBeforeText = strBeforeText.replace(/\n /g, '\n');
      strBeforeText = strBeforeText.replace(/`|@|#|\$|%|\^|&|\*|\\|\||;|♡|♥|§|×|÷|♤|♠|☆|♧|♣|$|€|£|¥|°|○|●|□|■|◇|※|《|》|¤|¡|¿|＃|＆|＊|＠|★|◎|◆|△|▲|▽|▼|→|←|↑|↓|↔|〓|◁|◀|▷|▶|⊙|◈|▣|◐|◑|▒|▤|▥|▨|▧|▦|▩|♨|☏|☎|☜|☞|¶|†|‡|↕|↗|↙|↖|↘|♭|♩|♪|♬|㉿|㈜|№|㏇|™|㏂|㏘|℡|®|ª|º|㉾/g, '');
      if(strBeforeText.charAt(0) === ' '){
        strBeforeText = strBeforeText.slice(1);
      }
      if(strBeforeText.charAt(0) === '\n'){
        strBeforeText = strBeforeText.slice(1);
      }
      _obj.value = strBeforeText;
      }
  }
  let objAllOpen = document.querySelectorAll('#primary input[type=text]');
  let objAnswers = document.querySelectorAll('.answers')
  for (i = 0; i < objAnswers.length; i++){
    objAnswers[i].addEventListener('animationstart', (event) => {
      for (k = 0; k < event.target.querySelectorAll('.custom-rank-sort input[type=text]').length; k++){
        if (event.target.querySelectorAll('.custom-rank-sort input[type=text]')[k].className.indexOf('customBadText') === -1){
          event.target.querySelectorAll('.custom-rank-sort input[type=text]')[k].classList.add('customBadText');
          event.target.querySelectorAll('.custom-rank-sort input[type=text]')[k].addEventListener('propertychange', (e) => {
            fnOpenCheck(e.target);
          })
          event.target.querySelectorAll('.custom-rank-sort input[type=text]')[k].addEventListener('change', (e) => {
            fnOpenCheck(e.target);
          })
          event.target.querySelectorAll('.custom-rank-sort input[type=text]')[k].addEventListener('keyup', (e) => {
            fnOpenCheck(e.target);
          })
          event.target.querySelectorAll('.custom-rank-sort input[type=text]')[k].addEventListener('paste', (e) => {
            fnOpenCheck(e.target);
          })
          event.target.querySelectorAll('.custom-rank-sort input[type=text]')[k].addEventListener('input', (e) => {
            fnOpenCheck(e.target);
          })
          event.target.querySelectorAll('.custom-rank-sort input[type=text]')[k].addEventListener('focus', (e) => {
            fnOpenCheck(e.target);
          })
          event.target.querySelectorAll('.custom-rank-sort input[type=text]')[k].addEventListener('blur', (e) => {
            fnOpenFilltering(e.target);
          })
        }
      }
    })
  }

  for (i = 0; i < objAllOpen.length; i++){
    if (objAllOpen[i].getAttribute('name') !== null && objAllOpen[i].getAttribute('name').indexOf('oe') !== -1){
      if (objAllOpen[i].className.indexOf('badText') === -1){
        objAllOpen[i].classList.add('badText');
      }
    }
  }
  for (i = 0; i < objAllOpen.length; i++){
    if (objAllOpen[i].getAttribute('name') !== null && objAllOpen[i].getAttribute('class').indexOf('other-open') !== -1){
      if (objAllOpen[i].className.indexOf('badText') === -1){
        objAllOpen[i].classList.add('badText');
      }
    }
  }
  for (index = 0; index < document.getElementsByClassName('badText').length; index++){
    document.getElementsByClassName('badText')[index].addEventListener('propertychange', (e) => {
      fnOpenCheck(e.target);
    })
    document.getElementsByClassName('badText')[index].addEventListener('change', (e) => {
      fnOpenCheck(e.target);
    })
    document.getElementsByClassName('badText')[index].addEventListener('keyup', (e) => {
      fnOpenCheck(e.target);
    })
    document.getElementsByClassName('badText')[index].addEventListener('paste', (e) => {
      fnOpenCheck(e.target);
    })
    document.getElementsByClassName('badText')[index].addEventListener('input', (e) => {
      fnOpenCheck(e.target);
    })
    document.getElementsByClassName('badText')[index].addEventListener('focus', (e) => {
      fnOpenCheck(e.target);
    })
    document.getElementsByClassName('badText')[index].addEventListener('blur', (e) => {
      fnOpenFilltering(e.target);
    })
  }
}


// BM Question JS
function bmQuestionHanler(questionClassName){
  const setQuestion = document.querySelector(questionClassName);
  if( setQuestion === undefined || setQuestion === null ) return;
  
  const brands = document.querySelectorAll(".brand select");
  const models = document.querySelectorAll(".model select");
  const modelOptions = [...models].map((item)=>{
    return [...item.options].map((option) => option.cloneNode(true));
  });
  
  const nones = document.querySelectorAll(".none-input");

  const hideModel = (brandSelect, brandIndex, modelSelect, backUpModel) => {

      const brand = brandIndex !== null ? brandSelect.options[brandIndex] : null;
      const brandCode = brand !== null ? brand.dataset.brand : null;
      
      modelSelect.selectedIndex = 0;
      
      [...modelSelect.options].slice(1).forEach( (model, index) => {
          model.parentNode.removeChild(model);
      });

      [...backUpModel].slice(1).forEach((model)=>{
        if( model.dataset.brand == brandCode ){
          modelSelect.appendChild(model);
        }
      });
      if( brandSelect.selectedIndex === 0 ){
        modelSelect.disabled = true;
      }else{
        modelSelect.disabled = false;
      }
  };

  const openHandler = (event, currSelect) => {
      const selectedOption = currSelect.options[currSelect.selectedIndex];
      const openClassName = currSelect.dataset.open;
      const openInput = document.querySelector(openClassName);
      if( !openInput ) return;

      const openFlag = selectedOption.dataset.oe;
      if( !openFlag ){
          openInput.disabled = true;
          return;
      }
      openInput.disabled = false;

      if( event.type === "change" ){
        openInput.focus();
      }
  };

  const noneHandler = (noneChk, index)=>{
    const brand = brands[index];
    const model = models[index];
    const items = [brand, model];

    if( noneChk.checked ){
      items.forEach( (item)=>{
        const openInput = document.querySelector(item.dataset.open);
        const selectedIndex = item.selectedIndex;
        const oeCheck = item.options[selectedIndex].dataset.oe;

        item.disabled = true;

        if( oeCheck ){
          openInput.disabled = true;
        }
      })
    }else{
      items.forEach( (item)=>{
        const openInput = document.querySelector(item.dataset.open);
        const selectedIndex = item.selectedIndex;
        const oeCheck = item.options[selectedIndex].dataset.oe;

        item.disabled = false;

        if( oeCheck ){
          openInput.disabled = false;
        }
      })
    }
  }

  brands.forEach( (item, index) => {
      const modelSelect = models[index];
      const backUpModel = modelOptions[index];
      item.addEventListener("change", (event) => {
          const brandSelected = item.selectedIndex;
          if( modelSelect.selectedIndex ){
            const openClassName = modelSelect.dataset.open;
            const openInput = document.querySelector(openClassName);
            if( openInput ){
              openInput.disabled = true;
            }
          }
          modelSelect.selectedIndex = 0;
          openHandler(event, item);
          hideModel(item, item.selectedIndex, modelSelect, backUpModel);
      });
      modelSelect.addEventListener("change", (event)=>{
        openHandler(event, modelSelect)
      });
      hideModel(item, item.selectedIndex, modelSelect, backUpModel);
      openHandler(event, item);
      openHandler(event, modelSelect);
  });

  nones.forEach( (none, index)=>{
    const noneChk = none.querySelector("input[type=checkbox]");
    none.addEventListener("click", ()=>{
        noneHandler(noneChk, index);
    });
    noneHandler(noneChk, index);
  });
}

// Group Toggle setting
function groupToggleSetting({qid, toggleClassName=".ch-group-toggle", groupRows=".ch-group-rows", groupTitle=".ch-group-name"}){
    const base = document.querySelector(qid);

    if( base == undefined || base == null ){
        return;
    }

    const groupToggle = base.querySelectorAll(toggleClassName);


    const maxHeightHandler = (groupRowCell, groupName, padding) => {
        const originalMaxHeight = groupRowCell.style.maxHeight;

        let paddingValue = 0;
        if( padding !== undefined && padding !== null ){
            paddingValue = parseInt(padding.replace('px', ''));
        }

        groupRowCell.style.maxHeight = 'none';
        const domMaxHeight = groupRowCell.offsetHeight + paddingValue + 3;
        groupRowCell.style.maxHeight = originalMaxHeight;

        window.requestAnimationFrame(() => {
            if (groupRowCell.style.maxHeight === '0px') {
                groupRowCell.style.maxHeight = `${domMaxHeight}px`;
                groupRowCell.style.padding = padding;
                groupName.classList.add('ch-open');
            } else {
                groupRowCell.style.maxHeight = '0px';
                groupRowCell.style.padding = '0';
                groupName.classList.remove('ch-open');
            }
        });
    };

    const groupSelected = () => {
        const groupToggle = base.querySelectorAll(toggleClassName);
        groupToggle.forEach((group) => {
            const groupRowCell = group.querySelector(groupRows);
            const groupName = group.querySelector(groupTitle);
            const selectedCheck = groupRowCell.querySelectorAll('input:checked');
            if(selectedCheck.length >= 1){
                groupName.classList.add('ch-group-selected');
            } else {
                groupName.classList.remove('ch-group-selected');
            }
        });
    };

    groupSelected();
    base.querySelector('.answers').addEventListener('click', groupSelected);

    const toggleArrow = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`;

    groupToggle.forEach((group) => {
        const groupRowCell = group.querySelector(groupRows);
        const groupName = group.querySelector(groupTitle);

        const style = window.getComputedStyle(groupRowCell);
        const padding = style.getPropertyValue('padding');

        groupName.style.cursor = 'pointer';

        const arrowDiv = document.createElement('div');
        arrowDiv.classList.add('ch-group-arrow');
        arrowDiv.innerHTML = toggleArrow;

        groupName.appendChild(arrowDiv);

        const clickHandler = () => maxHeightHandler(groupRowCell, groupName, padding);
        clickHandler();

        groupName.addEventListener('click', clickHandler);

        window.addEventListener('resize', () => {
            groupName.removeEventListener('click', clickHandler);
            if (groupName.classList.contains('ch-open')) {
                groupRowCell.style.maxHeight = 'none';
                const domMaxHeight = groupRowCell.offsetHeight;
                groupRowCell.style.maxHeight = `${domMaxHeight}px`;
            }
            groupName.addEventListener('click', clickHandler);
        });
    });
}

// Step By Step Question
function stepQuestion(bundleClassName){
     const setElements = document.querySelectorAll(bundleClassName);

     if( setElements === null || setElements === undefined || setElements.length === 0 ){
          return;
     }

     setElements.forEach((el)=>{
        const sts = el.querySelectorAll('.step-by-step');
        const lastIndex = sts.length - 1;
        const noneInput = el.querySelector('.none-input input[type=checkbox]');

        const noneHandler = ()=>{
          if( noneInput === null || noneInput === undefined ){
               return;
          }
          const noneIf = (select)=>{
               if( noneInput.checked ){
                    select.disabled = true;
               }else{
                    select.disabled = false;
               }
          }
          const noneOpen = (select)=>{
               const openDiv = select.parentElement.nextElementSibling;
               if( openDiv === null || openDiv === undefined ){
                    return;
               }

               if( !openDiv.classList.contains('step-by-step-oe')  ){
                    return;
               }

               const open = openDiv.querySelector('input[type=text]');
               if( open === null || open === undefined ){
                    return;
               }
               if( noneInput.checked ){
                    open.disabled = true;
               }else{
                    if( select.options[select.selectedIndex].dataset.open === '1' ){
                         open.disabled = false;
                    }else{
                         open.disabled = true;
                    }
               }
          }
          const eachHandler = (select)=>{
               noneIf(select);
               noneOpen(select);
          }
          sts.forEach((step, index)=>{
               const beforeIndex = index-1;
               if( index === 0 ){
                    eachHandler(step);
                    return;
               }else{
                    const beforeSelect = sts[beforeIndex];
                    if( beforeSelect.selectedIndex === 0 ){
                         step.disabled = true;
                    }else{
                         eachHandler(step);
                    }
               }
          });
        }

        noneHandler();

        el.addEventListener('change', ()=>{
          noneHandler();
        });

        const openHandler = (step, focus=true)=>{
             const openChk = step.options[step.selectedIndex].dataset.open;
             const openDiv = step.parentElement.nextElementSibling;
             
             if( openDiv === null || openDiv === undefined ){
                return;
             }

             if( !openDiv.classList.contains('step-by-step-oe')  ){
                return;
             }

             const open = openDiv.querySelector('input[type=text]');
             if( open === null || open === undefined ){
                return;
             }
             if( openChk === '1' ){
                open.disabled = false;
                if( focus ){
                    open.focus();
                }
             }else{
                open.disabled = true;
             }
        }

        sts.forEach((step, index)=>{
            const nextIndex = index + 1;
            
            openHandler(step, false);

            if( index === lastIndex ){
                step.addEventListener('change', ()=>{
                     openHandler(step);
                });
                return;
            }
            const nextSelectCopy = [...sts[nextIndex].options].map((option) => option.cloneNode(true));
            const nextSelect = sts[nextIndex];

            let stepBase = parseInt(nextSelect.dataset.stepbase);
            let stepKey = nextSelect.dataset.stepkey;

            const optionHandler = ()=>{
                let base = step.options[step.selectedIndex].dataset.base;

                if( (!isNaN(stepBase)) & ( stepKey !== undefined ) ){
                    const baseSelect = el.querySelector(`.step-by-step.step-${stepBase}`);
                    if( (baseSelect !== undefined && baseSelect !== null) && baseSelect.selectedIndex !== 0 ){
                        if( stepKey === "" || stepKey === undefined || stepKey === null){
                            stepKey = "base";
                        }
                        base = baseSelect.options[baseSelect.selectedIndex].dataset[stepKey];
                        //console.log(base);
                    }
                }

                if( base === null || base === undefined ){
                    [...nextSelect.options].slice(1).forEach( (item) => {
                        item.parentNode.removeChild(item);
                    });
                    nextSelect.selectedIndex = 0;
                    nextSelect.disabled = true;
                    return;
                }

                base = base.split(',');

                const showOptions = nextSelectCopy.filter((item)=> base.includes(item.dataset.code));
                 
                [...nextSelect.options].slice(1).forEach( (item) => {
                    const showValues = showOptions.map((opt)=>{return opt.value});
                    const currValue = item.value;
                    item.parentNode.removeChild(item);
                    // if( !showValues.includes(currValue) ){
                    //     item.parentNode.removeChild(item);
                    // }
                });

                const alreadyShowValues = [...nextSelect.options].map((opt)=>{return opt.value});
                [...showOptions].forEach((opt)=>{
                    if( !alreadyShowValues.includes(opt.value) ){
                        nextSelect.appendChild(opt);
                    }
                });

                nextSelect.disabled = false;
                const checkOption = [...nextSelect.options].slice(1);
                if( checkOption.length == 1 ){
                    if(nextSelect.selectedIndex !== 1){
                        nextSelect.selectedIndex = 1;
                        nextSelect.options[nextSelect.selectedIndex].click();
                        openHandler(nextSelect, false);
                    }
                }
            };

            optionHandler();
            openHandler(step, false);
            
            step.addEventListener('click', ()=>{
                optionHandler();
                openHandler(step, false);
            });

            step.addEventListener('change', ()=>{
                // reset
                [...sts].slice(index+1).forEach((rst)=>{

                    rst.selectedIndex = 0;
                    rst.disabled = true;
                    // if( step.selectedIndex === 0 ){
                    //     rst.disabled = true;
                    // }
                    const openDiv = rst.parentElement.nextElementSibling;

                    if( openDiv === null || openDiv === undefined ){
                        return;
                    }else{
                        const open = openDiv.querySelector('input[type=text]');
                        open.value = null;
                        open.disabled = true;
                    }
                });
                optionHandler();
                openHandler(step);
            });
        });
     });
}



function onerowatatime(_label, _row, _col, _answer, _result, _scroll, _next, _multi, _complete, _posfix){
  function fnNextActivate(_bol){
    const objNextBtn = document.getElementById('btn_continue');
    if(_next){
      if (_bol){
        objNextBtn.disabled = false;
      }
      else if (!_bol){
        objNextBtn.disabled = true;
      }
      else{
        console.log('chk_plz');
      }
    }
  }
  function fnOneRowStyle(){
    //console.log(strLabel);
    for(k = 0; k < document.querySelectorAll('style').length; k++){
      if (document.querySelectorAll('style')[k].getAttribute('media') == null){
       document.querySelectorAll('style')[k].innerHTML = document.querySelectorAll('style')[k].innerHTML + '@keyframes fallingFadeIn{0%{opacity : 0; transform : translateY(-10px);}100%{opacity : 1; transform : translateY(0px);}}@keyframes fallingInfinityScroll{0%{transform: translateY(-75%);}100%{transform: translateY(8%);}}#question_' + strLabel + ' .grid-list-mode .row-elements{transition-duration: 0.15s;}#question_' + strLabel + ' .grid-list-mode .clicked{background-color: rgba(45, 109, 246, 0.2);}#question_' + strLabel + ' .grid-list-mode .nextShow{animation : fallingFadeIn 0.5s 1 forwards;}#question_' + strLabel + ' .grid-table-mode .createWarp{height: 36px;}#question_' + strLabel + ' .grid-table-mode .createData{cursor: pointer;border: 1px solid #0c148b;overflow: hidden;}#question_' + strLabel + ' .grid-table-mode .createData:has(.arrowHover){transition-duration : 0.5s;color : white;background-color: #2d6df6;overflow: hidden;}#question_' + strLabel + ' .grid-table-mode .createArrowWrap{max-height: 36px;transform: translateY(-75%);pointer-events: none;}#question_' + strLabel + ' .grid-table-mode .arrowHover{animation : fallingInfinityScroll 0.7s infinite linear;}#question_' + strLabel + ' .grid-table-mode .createArrowWrap .downfallArrow{position: relative;display: block;width: 30px;left: 50%;transform: translateX(-50%);}#question_' + strLabel + ' .grid-list-mode .createWarp{position: relative;display: block;width: 100%;height: 36px;margin-top: 5px;border: 1px solid #ccc;border-radius: 10px;box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1);animation : fallingFadeIn 0.5s 1 forwards;overflow: hidden;}#question_' + strLabel + ' .grid-list-mode .createHead{pointer-events: none;}#question_' + strLabel + ' .grid-list-mode .createData{position: relative;display: block;height: 100%;width: 100%;cursor: pointer;overflow: hidden;}#question_' + strLabel + ' .grid-list-mode .createData:has(.arrowHover){transition-duration : 0.5s;color : white;background-color: #2d6df6;}#question_' + strLabel + ' .grid-list-mode .createArrowWrap{max-height: 36px;transform: translateY(-75%);pointer-events: none;}#question_' + strLabel + ' .grid-list-mode .arrowHover{animation : fallingInfinityScroll 0.7s infinite linear;}#question_' + strLabel + ' .grid-list-mode .createArrowWrap .downfallArrow{position: relative;display: block;width: 30px;left: 50%;transform: translateX(-50%);}.survey-buttons .showWrap{pointer-events: none;}.survey-buttons .showWrap .backgroundText{position: relative;display: block;opacity: 0;font-size: 0.9rem;pointer-events: none;}.survey-buttons .showWrap .showText{position: absolute;display: block;width: 100%;left: 50%;top: 50%;transform: translate(-50%, -50%);}.survey-buttons .showWrap .commonCheck{position: absolute;display: block;width: 20px;left: 50%;top: 50%;transform: translate(-50%, -50%);}';
       if(_posfix){
        document.querySelectorAll('style')[k].innerHTML = document.querySelectorAll('style')[k].innerHTML + '#primary:has(#question_' + strLabel + ') .survey-buttons .showWrap{position: absolute;display: inline-block;}';
       }
       else{
        document.querySelectorAll('style')[k].innerHTML = document.querySelectorAll('style')[k].innerHTML + '#primary:has(#question_' + strLabel + ' .answers-table) .survey-buttons .showWrap{position: absolute;display: inline-block;}#primary:has(#question_' + strLabel + ' .answers-list) .survey-buttons .showWrap{position: fixed;display: block;right: 5%;top: 2%;}';
       }
       break;
      }
    }
  }
  function fnShow(_target, _type, _click){
    if(_type === 'radio' || _type === 'all'){
      _target.style.display = ''; 
      _target.classList.add('nextShow');
    }
    else if(_type === 'checkbox'){
      if(_target.className.indexOf('row-col-legends') === -1){
        const objTargetParent = _target.parentNode;
        let numClickTargetIndex;
        for(i = 0; objTargetParent.childNodes.length; i++){
          if(objTargetParent.childNodes[i] === _click){
            numClickTargetIndex = i
            break;
          }
        }
        const objClickTarget = objTargetParent.childNodes[numClickTargetIndex];
        if(objClickTarget.getAttribute('class').indexOf('MA_continue') === -1){
          objClickTarget.classList.add('MA_continue');
          const objCreateWrap = document.createElement('tr');
          const objCreateTableHead = document.createElement('th');
          const objCreateTableData = document.createElement('td');
          const objCreateArrowWrap = document.createElement('div');
          const strDownfallArrow = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="downfallArrow" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" /></svg><svg xmlns="http://www.w3.org/2000/svg" fill="none" class="downfallArrow" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" /></svg>';
          objCreateWrap.className = 'createWarp';
          objCreateTableHead.className = 'createHead';
          objCreateTableData.className = 'createData';
          objCreateArrowWrap.className = 'createArrowWrap';
          objCreateTableData.setAttribute('colspan', numColCound);
          objCreateTableData.addEventListener('click', function(e){
            e.stopPropagation();
            e.preventDefault();
            fnFinder(e.target.parentNode, 'all', e.target.parentNode);
            e.target.parentNode.remove();
          })
          objCreateTableData.addEventListener('mouseover', function(e){
            e.target.childNodes[0].classList.add('arrowHover');
          })
          objCreateTableData.addEventListener('mouseleave', function(e){
            e.target.childNodes[0].classList.remove('arrowHover');
          })
          objCreateArrowWrap.innerHTML = strDownfallArrow;
          objCreateTableData.append(objCreateArrowWrap);
          objCreateWrap.append(objCreateTableHead);
          objCreateWrap.append(objCreateTableData);
          objTargetParent.insertBefore(objCreateWrap, _target);
        }
        if(!_multi){
          fnMultiAllClick(objTargetParent);
        }
      }
    }
  }
  function fnMultiAllClick(_target){
    while(_target.querySelectorAll('.createData').length != 0){
      _target.querySelector('.createData').click();
    }
  }
  function fnCheck(_target){
    let checkFlag = false;
    let strMainType = document.querySelectorAll('#question_' + strLabel + ' .grid tbody')[document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length - 1].querySelector('td input').type;
    while(_target.querySelectorAll('.hasError').length >= 1){
      _target.querySelectorAll('.hasError')[0].classList.remove('hasError');
    }
    for(i = 0; i < _target.querySelectorAll('input[type=' + strMainType + ']').length; i++){
      if(_target.querySelectorAll('.fir-icon')[i].className.indexOf('selected') !== -1 && _target.querySelectorAll('input[type=' + strMainType + ']')[i].checked){
        checkFlag = true;
        break;
      }
    }
    return checkFlag;
  }
  function fnAllCheck(){
    const objList = document.querySelectorAll('#question_' + strLabel + ' .grid tbody')[document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length - 1].childNodes;
    let strMainType = document.querySelectorAll('#question_' + strLabel + ' .grid tbody')[document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length - 1].querySelector('td input').type;
    for(i = 0; i < objList.length; i++){
      for(k = 0; k < objList[i].querySelectorAll('input[type=' + strMainType + ']').length; k++){
        if(objList[i].querySelectorAll('.fir-icon')[k].className.indexOf('selected') !== -1 && objList[i].querySelectorAll('input[type=' + strMainType + ']')[k].checked){
          objList[i].classList.add('clicked');
          break;
        }   
      }
    }
  }
  function fnScroll(_target, _str){
    const strCheck = _str === null ? 'blank' : _str
    if(_scroll){
      if(strCheck === 'end'){
        const objMain = document.getElementById('surveyContainer') === null ? document.querySelector('html') : document.getElementById('surveyContainer');
        objMain.scrollTop = objMain.scrollTop + document.querySelector('#btn_continue').getBoundingClientRect().top;
      }
      else if(strCheck === 'error'){
        const objMain = document.getElementById('surveyContainer') === null ? document.querySelector('html') : document.getElementById('surveyContainer');
        objMain.scrollTop = objMain.scrollTop + document.querySelector('#' + strLabel + '_error').getBoundingClientRect().top;
      }
      else{
        if(_target.className.indexOf('clicked') === -1){
          let strPlatform = document.querySelector('#question_' + strLabel + ' .grid').className.indexOf('grid-table-mode') !== -1 ? 'pc' : document.querySelector('#question_' + strLabel + ' .grid').className.indexOf('grid-list-mode') !== -1 ? 'mobile' : 'undefined'
          const objMain = document.getElementById('surveyContainer') === null ? document.querySelector('html') : document.getElementById('surveyContainer');
          const targetHeight = Number(getComputedStyle(_target).height.split('px')[0]); // 자동 스크롤 될 타겟의 height 값. 즉, 높이
          const targetPosY = _target.getBoundingClientRect().top; // 뷰포트 기준의 Y축 값. 즉, 상대적 Y좌표값
          const mainScrollPosY = objMain.scrollTop; // 스크롤을 할 수 있는 엘레먼트가 가지고 있는 현재 스크롤 Y좌표값. 
          if(strPlatform === 'pc'){
            const numMarginHeight = 100; // mainHeight는 응답자가 보고있는 화면(뷰포트) 기준으로 화면 높이 - 현재 스크롤 값. 즉, 나머지 스크롤 할 수 있는 값을 구함
            const mainHeight = document.getElementById('surveyContainer') === null ? window.innerHeight - numMarginHeight : Number(getComputedStyle(objMain).height.split('px')[0]) - numMarginHeight;
            if(mainHeight < (targetHeight + targetPosY)) objMain.scrollTop = mainScrollPosY + ((targetHeight + targetPosY) - mainHeight);
          }
          else if(strPlatform === 'mobile'){
            const numMarginHeight = 0;
            const mainHeight = document.getElementById('surveyContainer') === null ? window.innerHeight - numMarginHeight : Number(getComputedStyle(objMain).height.split('px')[0]) - numMarginHeight;
            let objMarginTarget = _target.previousSibling;
            let numMarginTop = 0;
            while(objMarginTarget !== null && (objMarginTarget.className.indexOf('row-group') !== -1 || objMarginTarget.className.indexOf('row-col-legends') !== -1)){
              numMarginTop += Number(getComputedStyle(objMarginTarget).height.split('px')[0]) + Number(getComputedStyle(objMarginTarget.querySelector('th')).marginBottom.split('px')[0]);
              objMarginTarget = objMarginTarget.previousSibling;
            }
            objMain.scrollTop = mainScrollPosY + targetPosY - numMarginTop;
          }
        }
      }
    }
  }
  function fnAnswerCount(){
    const numCount = document.querySelectorAll('#question_' + strLabel + ' .grid .clicked').length;
    return numCount;
  }
  function fnResultUpdate(){
    const objMain = document.querySelector('#question_' + strLabel);
    const objTargetWarp = objMain.parentNode.querySelector('.survey-buttons #' + strLabel + '_showWrap');
    const objTargetText = objTargetWarp.querySelector('.showText');
    const numTotal = numRowCound;
    const numCurrent = fnAnswerCount();
    const numCalc = numCurrent / numTotal * 100;
    const strInputType = objMain.querySelector('.answers .grid .row-elements td input').type;
    const strCompleteText = _complete === undefined || _complete === 'default' ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3.0" stroke="currentColor" class="commonCheck"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>' : _complete;
    objTargetText.innerText = numCurrent + " / " + numTotal;
    let arrCheckList = new Array();
    if(numCalc >= 100){
      objTargetWarp.classList.add('complete');
      objTargetText.classList.add('textComplete');
      objTargetText.innerHTML = strCompleteText;
      fnMultiAllClick(document.querySelector('#question_' + strLabel + ' .grid'));
      objTargetWarp.querySelector('.backgroundText').innerText = _complete === undefined || _complete === 'default' ? objTargetWarp.parentNode.querySelector('.survey-buttons #btn_continue').value : _complete;
      if(strInputType === 'radio') for(i = 0; i < objMain.querySelectorAll('.answers .grid tbody')[1].childNodes.length; i++){
        objMain.querySelectorAll('.answers .grid tbody')[1].childNodes[i].classList.add('nextShow');
      }
      else if(strInputType === 'checkbox') for(i = 0; i < objMain.querySelectorAll('.answers .grid .row-elements').length; i++){
        objMain.querySelectorAll('.answers .grid .row-elements')[i].classList.add('MA_continue');
      }
      if(objMain.querySelectorAll('.answers .grid tr .hasError').length === 0){
        if(numRowCound !== numCurrentAnswerCount){
          if(strInputType === 'radio') fnScroll(null, 'end');
        }
        else{
          numCurrentAnswerCount = 0;
        }
      }
    }
    else{
      objTargetWarp.classList.remove('complete');
      objTargetText.classList.remove('textComplete');
      objTargetWarp.querySelector('.backgroundText').innerText = objTargetWarp.parentNode.querySelector('.survey-buttons #btn_continue').value;
      if(!_multi) fnMultiAllClick(document.querySelector('#question_' + strLabel + ' .grid'));
    }
    for(i = 0; i < document.getElementsByClassName('showWrap').length; i++){
      if(document.getElementsByClassName('showWrap')[i].className.indexOf('complete') !== -1) arrCheckList[i] = true;
      else arrCheckList[i] = false;
    }
    if(arrCheckList.every(function(_bol){return _bol})) fnNextActivate(true);
    else fnNextActivate(false);
  }
  function fnResultShow(){ 
    const objShowCountArea = document.querySelector('#question_' + strLabel).parentNode.querySelector('.survey-buttons');
    const objShowWrap = document.createElement('div');
    const objBackgroundText = document.createElement('div');
    const objShowText = document.createElement('div');
    if(!_result) objShowWrap.setAttribute('style', 'display:none !important');
    objShowWrap.oncontextmenu = function(){ return false; };
    objShowWrap.onselectstart = function(){ return false; };
    objShowWrap.ondragstart = function(){ return false; };
    objShowWrap.onscroll = function(){ return false; };
    objBackgroundText.innerText = objShowCountArea.querySelector('#btn_continue').value;
    objShowWrap.id = strLabel + '_showWrap';
    objShowWrap.classList.add('showWrap');
    objShowWrap.classList.add('button');
    objShowText.classList.add('showText');
    objBackgroundText.classList.add('backgroundText');
    objShowWrap.append(objBackgroundText);
    objShowWrap.append(objShowText);
    objShowCountArea.append(objShowWrap);
    fnResultUpdate();
  }
  function fnFinder(_target, _type, _click){
    const objTargetParent = _target.parentNode;
    let numClickTargetIndex;
    for(i = 0; i < objTargetParent.childNodes.length; i++){
      if(objTargetParent.childNodes[i] === _click){
        numClickTargetIndex = i + 1;
        if(_type === 'radio' || _type === 'all'){
          for(k = numClickTargetIndex; k < objTargetParent.childNodes.length; k++){
            if(objTargetParent.childNodes[k].className.indexOf('row-group') !== -1 || objTargetParent.childNodes[k].className.indexOf('row-col-legends') !== -1){
              fnShow(objTargetParent.childNodes[k], 'all');
            }
            else if(objTargetParent.childNodes[k].className.indexOf('row-elements') !== -1){
              fnShow(objTargetParent.childNodes[k], _type, _click);
              fnScroll(objTargetParent.childNodes[k]);
              break;
            }
          }
        }
        else if(_type === 'checkbox'){
          fnShow(objTargetParent.childNodes[numClickTargetIndex], _type, _click);
        }
      }
    }
  }
  function fnInit(){
    fnNextActivate(false);
    const objMain = document.getElementById('surveyContainer') === null ? document.querySelector('html').style.scrollBehavior = 'smooth' : document.getElementById('surveyContainer').style.scrollBehavior = 'smooth';
    const arrCheckList = document.querySelectorAll('#question_' + strLabel + ' .grid .clickableCell');
    let strMainType = document.querySelectorAll('#question_' + strLabel + ' .grid tbody')[document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length - 1].querySelector('td input').type;
    for(i = 0; i < arrCheckList.length; i++){
      jQuery(arrCheckList[i].querySelector('input[type=' + strMainType + ']')).on("propertychange change input", (e) => {
        let tempCurrentParent = e.target.parentNode.className.indexOf('clickableCell') !== -1 ? e.target.parentNode.parentNode : e.target.parentNode.parentNode.parentNode.parentNode;
        let tempParentNext = tempCurrentParent.nextSibling;
        if(fnCheck(tempCurrentParent)){
          tempCurrentParent.classList.add('clicked');
        }
        else{
          tempCurrentParent.classList.remove('clicked');
        }
        fnResultUpdate();
        if(e.target.checked && tempParentNext !== null){
          fnFinder(tempParentNext, e.target.type, tempCurrentParent);
        }
      });
      if(arrCheckList[i].parentNode.nextSibling !== null){
        if(arrCheckList[i].querySelector('.fir-icon').className.indexOf('selected') !== -1 && arrCheckList[i].querySelector('input[type=' + strMainType + ']').checked){
          fnShow(arrCheckList[i].parentNode.nextSibling, 'all');
        }
      }
    }
    for(i = 0; i < document.querySelectorAll('#question_' + strLabel + ' .grid tr').length; i++){
      if(document.querySelectorAll('#question_' + strLabel + ' .grid tr')[i].className.indexOf('hasError') !== -1){
        fnScroll(null, 'error');
        break;
      }
    }
    fnOneRowStyle();
    fnAllCheck();
    fnResultShow();
  }
  const strLabel = _label;
  const numRowCound = _row;
  const numColCound = _col;
  let numCurrentAnswerCount = _answer;
  if(numRowCound <= 1 || numColCound <= 1){
    console.log('onerowatatime not activate. row or col is 1 or less.');
  }
  else if(document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length !== 2 || document.querySelectorAll('#question_' + strLabel + ' .grid tbody')[document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length - 1].querySelectorAll('.row-elements').length === 0){
    console.log('onerowatatime not activate. DOM structures are not suitable for function execution.');
  }
  else if(numRowCound === numCurrentAnswerCount){
    const objTarget = document.querySelectorAll('#question_' + strLabel + ' .grid tbody')[document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length - 1];
    let strMainType = document.querySelectorAll('#question_' + strLabel + ' .grid tbody')[document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length - 1].querySelector('td input').type;
    for(k = 0; k < objTarget.childNodes.length; k++){
      if(objTarget.childNodes[k].className.indexOf('row-group') !== -1 || objTarget.childNodes[k].className.indexOf('row-col-legends') !== -1){
        fnShow(objTarget.childNodes[k], 'all');
      }
      else if(objTarget.childNodes[k].className.indexOf('row-elements') !== -1){
        fnShow(objTarget.childNodes[k], 'all');
        break;
      }
    }
    if(objTarget.childNodes[objTarget.childNodes.length - 1].className.indexOf('row-col-legends') !== -1) fnShow(objTarget.childNodes[objTarget.childNodes.length - 1], 'all');
    fnInit();
  }
  else{
    const objTarget = document.querySelectorAll('#question_' + strLabel + ' .grid tbody')[document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length - 1];
    let strMainType = document.querySelectorAll('#question_' + strLabel + ' .grid tbody')[document.querySelectorAll('#question_' + strLabel + ' .grid tbody').length - 1].querySelector('td input').type;
    for(i = 0; i < objTarget.childNodes.length; i++){
      objTarget.childNodes[i].setAttribute('style', 'display:none !important');
    }
    if(numRowCound !== numCurrentAnswerCount){
      for(k = 0; k < objTarget.childNodes.length; k++){
        if(objTarget.childNodes[k].className.indexOf('row-group') !== -1 || objTarget.childNodes[k].className.indexOf('row-col-legends') !== -1){
          fnShow(objTarget.childNodes[k], 'all');
        }
        else if(objTarget.childNodes[k].className.indexOf('row-elements') !== -1){
          fnShow(objTarget.childNodes[k], 'all');
          break;
        }
      }
      if(objTarget.childNodes[objTarget.childNodes.length - 1].className.indexOf('row-col-legends') !== -1) fnShow(objTarget.childNodes[objTarget.childNodes.length - 1], 'all');
      fnInit();
    }
  }
}

function fnEventRemove(_label){
  const objTarget = document.querySelector('#question_' + _label);
  const objClone = objTarget.cloneNode(true);
  objTarget.parentNode.replaceChild(objClone, objTarget);
  objClone.style.pointerEvents = "none";
  objClone.setAttribute('tabindex', '-1');
  objClone.oncontextmenu = function(){ return false; };
  objClone.onselectstart = function(){ return false; };
  objClone.ondragstart = function(){ return false; };
}

// Dial
function hexToRgbA(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createDial(
    selector = ".custom-diar",
    barColor = "#2d6df6",
    barWidth = 50,
    backGroundColor = "lightgray",
    inputWidth = 80,
    inputFontSize = 38,
    rounded = true,
    canvasSize = 200
) {
    const diars = document.querySelectorAll(selector);
    let currentAngle = 0;
    let targetAngle = 0;

    // 숨기기 스타일 추가
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
${selector} {
  position: relative;
  width: ${canvasSize}px;
  height: ${canvasSize}px;
}

@media (max-width: 800px){
    ${selector} {
        margin: 0 auto;
    }
}

${selector} canvas {
  transform: rotate(90deg);
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}

${selector} input[type=number] {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${inputWidth}px;
  text-align: center;
  border: 1px solid ${backGroundColor};
  border-radius: 10px;
  outline: none;
  color: ${barColor};
  font-size: ${inputFontSize}px;
  transition: border 0.25s, box-shadow 0.25s;
}
${selector} input[type=number]:focus {
  border: 1px solid ${barColor};
  box-shadow: 0 0 10px ${hexToRgbA(barColor, 0.5)};
}


${selector} input[type=number]::-webkit-inner-spin-button, 
${selector} input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}`;
    document.head.appendChild(styleSheet);


    diars.forEach(diar => {
        const canvas = diar.querySelector('canvas');
        const inputElem = diar.querySelector('input');
        const minValue = parseInt(inputElem.getAttribute('min'));
        const maxValue = parseInt(inputElem.getAttribute('max'));

        canvas.width = canvasSize;
        canvas.height = canvasSize;

        const ctx = canvas.getContext('2d');
        let isDragging = false;

        function drawDonut(value) {
            const angleValue = ((value - minValue) / (maxValue - minValue)) * 2 * Math.PI;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 배경 도넛
            ctx.beginPath();
            ctx.arc(canvasSize / 2, canvasSize / 2, (canvasSize / 2) - (barWidth / 2), 0, 2 * Math.PI);
            ctx.lineWidth = barWidth;
            ctx.strokeStyle = backGroundColor;
            ctx.stroke();

            // 색을 채운 도넛
            if (rounded) ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(canvasSize / 2, canvasSize / 2, (canvasSize / 2) - (barWidth / 2), 1.5 * Math.PI, 1.5 * Math.PI + angleValue);
            ctx.lineWidth = barWidth;
            ctx.strokeStyle = barColor;
            ctx.stroke();
            ctx.lineCap = 'butt';
        }

        function updateDial(x, y) {
            const angle = Math.atan2(y - (canvasSize / 2), x - (canvasSize / 2));
            const filledAngle = angle >= 0 ? angle : 2 * Math.PI + angle;
            const value = minValue + Math.round((filledAngle / (2 * Math.PI)) * (maxValue - minValue));
            inputElem.value = value;
            drawDonut(value);
        }

        drawDonut(parseInt(inputElem.value));

        function startDial(x, y, prevent=false){
            isDragging = true;
            updateDial(
                x - canvas.getBoundingClientRect().left, 
                y - canvas.getBoundingClientRect().top
            )

            if( prevent ){
                event.preventDefault();
            }
        }

        function endDial(){
            isDragging = false;
        }

        function moveDial(x, y, prevent=false){
            if (isDragging) {
                updateDial(
                    x - canvas.getBoundingClientRect().left, 
                    y - canvas.getBoundingClientRect().top
                );
            }
            if( prevent ){
                event.preventDefault();
            }
        }

        canvas.addEventListener('mousedown', (event) => { startDial(event.clientX, event.clientY); });
        canvas.addEventListener('touchstart', (event) => { startDial(event.touches[0].clientX, event.touches[0].clientY, true); });

        canvas.addEventListener('mousemove', (event) => { moveDial(event.clientX, event.clientY); });
        canvas.addEventListener('touchmove', (event) => { moveDial(event.touches[0].clientX, event.touches[0].clientY, true); });

        canvas.addEventListener('mouseup', () => { endDial(); });
        canvas.addEventListener('mouseleave', () => { endDial(); });
        canvas.addEventListener('touchend', () => { endDial(); });

        inputElem.addEventListener('input', () => {
            let value = parseInt(inputElem.value);
            
            // 입력 값이 유효 범위를 벗어나면 초기값으로 재설정
            if (value > maxValue) {
                value = '';
                inputElem.value = value;
            } else if (value < minValue || isNaN(value)) {
                value = '';
                inputElem.value = value;
            }

            drawDonut(value);
        });
    });
}


// Custom Button Style JS
const updateLabelStyle = (element, isSelected)=>{
   const label = element.querySelector('.cell-sub-wrapper');
   if (label) {
       label.style.backgroundColor = isSelected ? '#b7ceff' : '';
   }
}

const maxHeightHandler = (applyElement, baseElement, init=true, padding='5px') => {
    const originalMaxHeight = applyElement.style.maxHeight;

    let paddingValue = 0;
    if( padding !== undefined && padding !== null ){
        paddingValue = parseInt(padding.replace('px', ''));
    }

    applyElement.style.maxHeight = 'none';
    const domMaxHeight = applyElement.offsetHeight + paddingValue + 3;
    applyElement.style.maxHeight = originalMaxHeight;

    if( init ){
        window.requestAnimationFrame(() => {
            if (applyElement.style.maxHeight === '0px') {
                applyElement.style.maxHeight = `${domMaxHeight}px`;
                applyElement.style.padding = padding;
                baseElement.classList.add('ch-open');
            } else {
                applyElement.style.maxHeight = '0px';
                applyElement.style.padding = '0';
                baseElement.classList.remove('ch-open');
            }
        });
    }else{
        window.requestAnimationFrame(() => {
            applyElement.style.maxHeight = `${domMaxHeight}px`;
            applyElement.style.padding = padding;
            baseElement.classList.add('ch-open');
        });
    }
};

function handleButtonColor(element) {
    const firIcon = element.querySelector('.fir-icon');
    const isSelected = firIcon && firIcon.classList.contains('selected');
    updateLabelStyle(element, isSelected);
}

const observeElements = () => {
    const elements = document.querySelectorAll('.sp-custom-btn .answers .element');
    
    elements.forEach(element => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    handleButtonColor(element);
                }
            });
        });

        observer.observe(element, { attributes: true, subtree: true });
        handleButtonColor(element);
    });
}

const setCustomBtn = ()=>{
  const btnClass = document.querySelectorAll('.sp-custom-btn');

  if( btnClass.length == 0 ){
    return;
  }
  
  observeElements();

  btnClass.forEach((btn, btnIndex)=>{
    const btnClassList = btn.classList;
    const btnId = btn.id;

    const checkCols = [...btnClassList].filter(cl => cl.includes('btn-cols-'));

    const minColClass = [...btnClassList].filter(cl => cl.includes('min-col-'));
    const minColCount = minColClass.length >= 1 ? minColClass[0].split('-')[2] : 1;

    let colNumber = checkCols.length >= 1 ? checkCols[0].split('-')[2] : 1;
    if( minColCount > 1 && colNumber == 1 ){
        colNumber = minColCount; 
    }
    const newClassName = `custom-btn-cols-${colNumber}`;

    if( btn.querySelector('.grid-table-mode') && !btn.querySelector('.grid-list-mode') ){
        return;
    }

    const singleDimension = (btn.classList.contains('noCols') || btn.classList.contains('noRows'))
    const elCount = btn.querySelectorAll('.answers .element:not(.btn-bot):not(.btn-top)').length;
    const exclusiveColNumber = elCount >= colNumber ? -1 : (elCount - colNumber) - 1;

    const mainStyle = document.createElement('style');

    const cardMaxWidth = [...btn.classList].filter((cl)=> cl.includes('card-mw-'));

    let setCardMaxWidth = 924;
    if( cardMaxWidth.length == 1 ) {
        setCardMaxWidth = cardMaxWidth[0].split('-').slice(-1)[0];
    }


    mainStyle.innerHTML = `
#${btnId}.sp-custom-card.noCols .answers .legend.col-legend {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    text-align: center;
    font-weight: bold;
    font-size: 1.3rem;
    background-color: #b7ceff;
    border: 1px solid #343434;
    border-radius: 7px;
    padding:5px;
    grid-column: 1/-1;
}

#${btnId}.sp-custom-card.noCols .answers {
    max-width: ${setCardMaxWidth}px;
}

#${btnId} .zeroHeight {
    display: none!important;
}

#${btnId} .btn-exclusive {
    max-width: 924px;
}

#${btnId} .btn-exclusive {
  display: grid;
  grid-template-columns: repeat(${colNumber}, 1fr);
  grid-column-gap: 5px;
  grid-row-gap: 5px;
}

#${btnId} .btn-exclusive .element {
  grid-column: 1/${exclusiveColNumber};
}

#${btnId}.sp-custom-btn .answers .element {
  padding: unset;
  border-radius: 7px;
  margin-bottom: 3px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

#${btnId}.sp-custom-btn .answers .element .cell-text {
  width: 100%;
  max-width: 924px;
  padding: 5px;
}

#${btnId}.sp-custom-btn .answers .element { 
    transition: background-color 0.5s, opacity 0.5s;
}

#${btnId}.sp-custom-btn .answers .element img { 
    pointer-events: none;
    width: 100%;
}

#${btnId}.sp-custom-btn .grid-list-mode .cell.element {
    border: 1px solid #959595;
}

#${btnId}.sp-custom-btn .answers .element .cell-sub-wrapper {
  padding-left: 0.25em;
  border-radius: 7px;
  width: 100%;
  max-width: 924px;
  overflow: hidden;
}


#${btnId}.sp-custom-btn .answers .element .cell-sub-wrapper .cell-sub-column {
  height: 100%;
}

#${btnId}.sp-custom-btn .answers .element label {
  display: block;
  width: 100%;
  height: 100%;
  padding: 5px;
  font-size: 1.2rem;
}

#${btnId}.sp-custom-btn .answers .element input[type="text"] {
  margin-left: 6px;
}

.hasError .ch-group-toggle .ch-group-rows .hasError .cell-text {
    border-bottom: unset !important;
}

#${btnId}.sp-custom-btn .ch-group-toggle .hasError.element .cell-sub-wrapper {
    border: 1px solid #e7046f;
}

#${btnId}.sp-custom-btn.hasError .ch-group-toggle .ch-group-rows {
    background-color: unset !important;
}

#${btnId}.sp-custom-btn .element.hasError:not(.btn-hover) {
    background-color: unset !important;
}

#${btnId}.sp-custom-btn .element.hasError .cell-sub-wrapper{
  border-color: #e7046f!important;
}

.btn-hover {
  background-color: #b7ceff!important;
}

@media (max-width: 768px) {
  #${btnId}.sp-custom-btn .answers .element {
    max-width: 100%;
  }

  #${btnId}.sp-custom-btn .answers .element input[type="text"] {
    width: 90%;
  }

  #${btnId}.sp-custom-btn .answers .element label { 
    font-size: 1.1rem;
  }

  #${btnId} .btn-exclusive .element {
    grid-column: 1/-1;
  }
}
  `;
    document.head.appendChild(mainStyle);

    const style = document.createElement('style');
    btn.querySelector('.answers').appendChild(style);
    
    // With Custom Toggle Group 
    const groupRow = btn.querySelectorAll('.ch-group-rows');
    style.innerHTML = `
#${btnId} .${newClassName} ${groupRow.length>=1 ? '.ch-group-rows' : ''}{
  display: grid;
  grid-template-columns: repeat(${colNumber}, 1fr);
  width: 100% !important;
  grid-column-gap: 5px;
  grid-row-gap: 5px;
  max-width: 924px;
  align-items: stretch;
  ${groupRow.length>=1 ? 'padding: 5px;' : ''}
}

#${btnId} .${newClassName} .element {
    display: flex;
    align-items: stretch;
}
`;

      if (colNumber >= 3) {
        style.innerHTML += `
@media (max-width: 1000px) {
    #${btnId} .${newClassName} ${groupRow.length>=1 ? '.ch-group-rows' : ''}{
      grid-template-columns: repeat(${minColCount == 1 ? 2 : (colNumber-1 > minColCount ? colNumber-1 : minColCount)}, 1fr);
    }
}`;
    }

    const answers = btn.querySelector('.answers');
    const mainBefore = document.createElement('div');
    const mainAfter = document.createElement('div');
    answers.parentNode.insertBefore(mainBefore, answers);
    answers.parentNode.insertBefore(mainAfter, answers.nextSibling);

    mainBefore.classList.add('answers', 'btn-exclusive', 'answers-before');
    mainAfter.classList.add('answers', 'btn-exclusive', 'answers-after');

    if( !singleDimension ){
        btn.querySelectorAll('.row-elements').forEach((row)=>{
            row.classList.add(newClassName);
        });
        style.innerHTML += `
#${btnId} .row-elements th, #${btnId} .row-elements .mobile-group-legend{
    grid-column: 1 / -1;
    margin: 0 -5px 0 -5px;
}

#${btnId} .${newClassName} {
    padding: 0 5px 5px 5px;
}

#${btnId} .btn-bot, #${btnId} .btn-top {
    grid-column: 1 / -1;
}
        `;
    }else{
        answers.classList.add(newClassName);
        style.innerHTML += `
#${btnId}.sp-custom-btn .answers .element .cell-sub-wrapper {
  border: 1px solid #959595;
}
        `;
    }
    
    const checkMaxWidth = [...btnClassList].filter((cl)=> cl.includes('btn-mw-'));

    if( checkMaxWidth.length == 1 ) {
        const setMaxWidth = checkMaxWidth[0].split('-').slice(-1)[0];
        style.innerHTML += `
#${btnId} .answers {
    max-width: ${setMaxWidth}px;
}
`;
    }

    style.innerHTML += `
@media (max-width: 768px) {
    #${btnId} .${newClassName} ${groupRow.length>=1 ? '.ch-group-rows' : ''}{
        grid-template-columns: repeat(${minColCount}, 1fr);
    }

    #${btnId} .answers {
        max-width: 100%;
    }

    #${btnId} .answers .element {
        max-width: 100% !important;
    }
}`;


    const wrapper = btn.querySelectorAll('.answers .element');
    let maxHeight = Array.from(wrapper).reduce((max, el) => Math.max(max, el.clientHeight), 0);

    if( maxHeight <= 50 ){
        maxHeight = 50;
    }

    style.innerHTML +=  `
#${btnId} .${newClassName} .cell-sub-wrapper {
    min-height: ${maxHeight}px;
}

#${btnId} .btn-exclusive .cell-sub-wrapper {
    min-height: 50px;
}
    `;

    const elements = btn.querySelectorAll('.answers .element');

    elements.forEach((element)=>{
        const labelNode = element.querySelector('label');
        const inputNode = element.querySelector('input');
        const openCheck = element.querySelector('input[type=text], input[type=number], input[type=time], input[type=date], input[type=month], select');
        
        const firCheck = element.querySelector('.fir-icon');
        //firCheck.style.pointerEvents = 'none';

        const notClickNodes = ['label', 'input', 'input[type=text]', 'rect', 'polygon', 'circle', '.fir-icon']
        const notClickNodesMap = notClickNodes.map((nd)=> element.querySelector(nd));
        
        if( singleDimension ){
            if( element.classList.contains('btn-top') ){
                mainBefore.appendChild(element);
            }

            if( element.classList.contains('btn-bot') ){
                mainAfter.appendChild(element);
            }
        }

        element.addEventListener('click', (event) => {
            // if (!notClickNodesMap.includes(event.target)) {
            //     labelNode.click();
            // }

            const cond = ['element', 'cell-input', 'cell-text', 'cell-sub-wrapper'].some(className => event.target.classList.contains(className));
            if( cond ){
                labelNode.click();
            }

            if( openCheck && inputNode.checked ) {
                openCheck.focus();
            }
        });

        ['touchstart', 'mouseover'].forEach((ev)=>{
            element.addEventListener(ev, () => {
                element.classList.add('btn-hover');
            });
        });
        ['touchend', 'mouseout'].forEach((ev)=>{
            element.addEventListener(ev, () => {
                element.classList.remove('btn-hover');
            });
        });
    });

    // Exclusive Group Hidden
    const toggleGroups = btn.querySelectorAll('.ch-group-toggle');
    toggleGroups.forEach((tog)=>{
        const togRow = tog.querySelector('.ch-group-rows');
        if(togRow.children.length == 0){
            tog.classList.add('hidden');
        }
    });

  
    // Loop Custom Btn
    const btnFocusFlag = btn.classList.contains('btn-focus');
    if( btnFocusFlag ){
        style.innerHTML += `
#${btnId}.question.sp-custom-btn {
  max-width: 924px;
  border: 1px solid #ccc;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-radius: 10px;
  overflow: hidden;
}

#${btnId}.question.sp-custom-btn .question-text {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  margin-bottom: unset;
}

#${btnId}.question.sp-custom-btn .instruction-text {
  display: none;
}

#${btnId}.answers-before {
  display: none;
}

#${btnId}.question.sp-custom-btn .answers {
  padding: 5px;
}


.question-error-text {
    padding: 5px;
}

* {
  scroll-behavior: smooth;
}
`;
        const questionText = btn.querySelector('.question-text');
        questionText.setAttribute('tabindex', btnIndex);

        // Toggle TBD
        // const baseElement = btn.querySelector('.question-text');
        // const applyElement = btn.querySelectorAll('.answers');

        // const clickHandler = (init=true)=>{
        //     [...applyElement].forEach((el, index)=>{
        //          maxHeightHandler(el, baseElement, init);
        //     });
        // }

        // if( btn.classList.contains('hasError') ){
        //     clickHandler(false);
        // }else{
        //     if( btnIndex === 0 ){
        //         clickHandler(false);
        //     }else{
        //         clickHandler();
        //     }
        // }

        // baseElement.addEventListener('click', ()=>{
        //     clickHandler();
        // });

    } else {
        style.innerHTML += `
.answers-before {
    margin-bottom: 7px;
}

.answers-after {
    margin-top: 7px;
}
`;
    }


    // Focus Setting
    if( btnFocusFlag ){
        if( btn.classList.contains('noCols', 'radio') || btn.classList.contains('noRows', 'radio') ){
            if( btn.classList.contains('checkbox') ){
                return;
            }
            const focusBase = btn.querySelector('.question-text');
            const selectedStatus = (document.querySelectorAll('.fir-icon.selected').length == 0 || document.querySelectorAll('.hasError').length == 0);

            const lastIndex = btnClass.length-1;
            const continueBtn = document.querySelector('.button.continue');
            elements.forEach((el)=>{
                const hasOpen = el.querySelector('input[type=text], input[type=number], select');

                el.addEventListener('click', ()=>{
                    const elRadio = el.querySelector('input[type=radio]');
                    if( hasOpen ){
                        hasOpen.focus();
                    }else{
                        if(el.querySelector('.fir-icon.selected')){
                            if( btnIndex === lastIndex ){
                                continueBtn.focus();
                                if( btn.classList.contains('auto-continue') && selectedStatus ){
                                    continueBtn.click();
                                }
                            }else{
                                let nextFocus = btnIndex+1
                                let continueClickFlag = false;
                                while (true) {
                                    if( nextFocus >= [...btnClass].length ){
                                        continueClickFlag = true;
                                        break
                                    }
                                    let chkFir = [...btnClass][nextFocus].querySelectorAll('.fir-icon.selected');
                                    if( chkFir.length === 0 ){
                                        break;
                                    }
                                    nextFocus++;
                                }

                                if( !continueClickFlag ){
                                    const nextQuestionText = [...btnClass][nextFocus].querySelector('.question-text');
                                    nextQuestionText.focus();                                
                                }else{
                                    continueBtn.focus();
                                    if( btn.classList.contains('auto-continue') && selectedStatus ){
                                        continueBtn.click();
                                    }
                                }

                            }
                        }
                    }
                });
            });
        }
    }

  });
}

// window.addEventListener('DOMContentLoaded', setCustomBtn);


// Number Question Focus
const customInputBox = ()=>{
    const inputBoxQuestion = document.querySelectorAll('.sp-custom-input');
    if(inputBoxQuestion.length == 0){
        return;
    }

    const mainStyle = document.createElement('style');
    mainStyle.innerHTML = '';
    document.head.appendChild(mainStyle);

    inputBoxQuestion.forEach((numq) => {
        const inputBoxId = numq.id;

        if (!(numq.classList.contains('number') || numq.classList.contains('text'))) {
            return;
        }

        const checkMaxWidth = [...numq.classList].filter((cl) => cl.includes('ip-mw-'));
        
        let setMaxWidth = null;
        if (checkMaxWidth.length == 1) {
            setMaxWidth = checkMaxWidth[0].split('-').slice(-1)[0];
        }

        if (numq.classList.contains('noCols') && numq.classList.contains('noRows')) {
            if (setMaxWidth !== null) {
                mainStyle.innerHTML += `
#${inputBoxId} .answers .input[type=number], #${inputBoxId} .answers .input[type=text] {
    max-width: ${setMaxWidth}px;
}`;
            }
            return;
        }

        
        if (setMaxWidth !== null) {
            const setMaxWidth = checkMaxWidth[0].split('-').slice(-1)[0];
            mainStyle.innerHTML += `
#${inputBoxId} .answers {
    max-width: ${setMaxWidth}px;
}`;
        }

        const checkCols = [...numq.classList].filter(cl => cl.includes('ip-cols-'));
        const colsFlag = (checkCols.length >= 1);

        let colNumber = colsFlag ? checkCols[0].split('-')[2] : 1;

        const minColClass = [...numq.classList].filter(cl => cl.includes('min-col-'));
        const minColCount = minColClass.length >= 1 ? minColClass[0].split('-')[2] : 1;

        if (minColCount > 1 && colNumber == 1) {
            colNumber = minColCount;
        }

        mainStyle.innerHTML += `
#${inputBoxId}.sp-custom-input .pre-text {
    display: block;
}

#${inputBoxId}.sp-custom-input .post-text {
    vertical-align: middle;
}

#${inputBoxId}.sp-custom-input input {
    width: 40%;
}

#${inputBoxId}.sp-custom-input .answers div.element .cell-legend-above {
  width: 100%;
}

#${inputBoxId}.sp-custom-input .answers div.element.groupingCols .cell-text {
  border-bottom: 1px solid #ccc;
  transition: background-color 0.5s;
  font-size: 1.3rem;
}

#${inputBoxId}.sp-custom-input .answers div.element.groupingCols .cell-text label {
  width: 100%;
  padding: 10px;
  display: block;
}

#${inputBoxId}.sp-custom-input .answers div.element .cell-input {
  padding: 10px 10px 10px 13px;
  display: flex;
}

#${inputBoxId}.sp-custom-input .answers div.element.groupingCols .cell-sub-wrapper {
  overflow: hidden;
  border: 1px solid #ccc;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

#${inputBoxId}.sp-custom-input .answers div.element.groupingCols .cell-sub-wrapper:hover .cell-text {
  background-color: #b7ceff;
}

#${inputBoxId} .ch-group-toggle .indent-2 {
    padding-left: .4em;
}

#${inputBoxId} .ch-group-toggle .ch-group-rows {
    padding: 5px;
}
`;

        if (colsFlag) {
            const groupElements = document.querySelectorAll(`#${inputBoxId} .ch-group-toggle`);

            if (!(numq.classList.contains('noCols') || numq.classList.contains('noRows'))) {

                let gridClass = '.grid-list-mode tbody';
                if( groupElements.length >= 1 ){
                    gridClass = '.ch-group-rows';
                }
                mainStyle.innerHTML += `
#${inputBoxId}.sp-custom-input .answers ${gridClass} {
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(${colNumber}, 1fr);
}

#${inputBoxId}.sp-custom-input .answers ${gridClass} .row-elements {
    margin-top: unset !important;
}`;

                if (colNumber >= 3) {
                    mainStyle.innerHTML += `
@media (max-width: 1000px) {
    #${inputBoxId}.sp-custom-input .answers ${gridClass} {
      grid-template-columns: repeat(${minColCount == 1 ? 2 : (colNumber-1 > minColCount ? colNumber-1 : minColCount)}, 1fr);
    }
}`;
                }

                mainStyle.innerHTML += `
@media (max-width: 768px) {
    #${inputBoxId}.sp-custom-input .answers ${gridClass} {
        grid-template-columns: repeat(${minColCount}, 1fr);
    }

    #${inputBoxId}.sp-custom-input .answers ${gridClass} {
        max-width: 100%;
    }
}
                `;

            } else {

                let gridClass = '.answers';
                if( groupElements.length >= 1 ){
                    gridClass = '.ch-group-rows';
                }
                mainStyle.innerHTML += `
#${inputBoxId}.sp-custom-input ${gridClass} {
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(${colNumber}, 1fr);
}

#${inputBoxId}.sp-custom-input ${gridClass} .element {
    padding: unset;
}`;

                if (colNumber >= 3) {
                    mainStyle.innerHTML += `
@media (max-width: 1000px) {
    #${inputBoxId}.sp-custom-input ${gridClass} {
      grid-template-columns: repeat(${minColCount == 1 ? 2 : (colNumber-1 > minColCount ? colNumber-1 : minColCount)}, 1fr);
    }
}`;
                }

                mainStyle.innerHTML += `
@media (max-width: 768px) {
    #${inputBoxId}.sp-custom-input ${gridClass} {
        grid-template-columns: repeat(${minColCount}, 1fr);
    }

    #${inputBoxId}.sp-custom-input ${gridClass} {
        max-width: 100%;
    }

    #${inputBoxId}.sp-custom-input ${gridClass} .element {
        max-width: 100% !important;
        padding: .4em .4em .4em 0;
    }
}`;
            }
        }


        const elements = numq.querySelectorAll('.element');

        if (elements.length == 0) {
            return;
        }

        // table mode skip
        const tableMode = numq.querySelector('.grid-table-mode');
        if (tableMode) {
            return;
        }

        elements.forEach((el) => {
            const cellInput = el.querySelector('.cell-input');
            if (!cellInput) {
                return;
            }

            cellInput.style.cursor = 'pointer';

            const inputBox = el.querySelector('input[type="number"], input[type="text"], select');
            cellInput.addEventListener('click', () => {
                if (inputBox) {
                    inputBox.focus();
                }
            });
        });
    });



}


const checkElement = (el) => {
    return (el !== undefined && el !== null)
}

const autoClickContinue = (flag)=>{
    if(!flag){ return }

    const questions = document.querySelectorAll('.question');
    const questionRadio = document.querySelectorAll('.question.radio.noCols, .question.radio.noRows');
    
    if( questions === undefined || questions === null ){
        return
    }

    if( (questions.length > 1) ){ 
        return 
    }

    const continueBtn = document.querySelector('#btn_continue');

    [...questionRadio].forEach((radio)=>{
        // atmtable
        if( radio.classList.contains('sq-atmtable') ){
            const atmtableBtn = radio.querySelectorAll('.sq-atmtable-btn');
            [...atmtableBtn].forEach((btn)=>{
                btn.addEventListener('click', ()=>{
                    const btnInput = btn.querySelector('input[type=radio]');
                    btnInput.checked = true;
                    btn.classList.add('.sq-atmtable-btn-selected');
                    continueBtn.click();
                });
            })
        }else{
            const elements = radio.querySelectorAll('.element');
            if( elements.length == 0 ){
                return;
            }

            elements.forEach((element)=>{
                element.addEventListener('click', ()=>{
                    const inputRadio = element.querySelector('input[type=radio]:checked');
                    const inputText = element.querySelector('input[type=text]');

                    if( !checkElement(inputText) ){
                        if( checkElement(inputRadio) ){
                            continueBtn.click();
                        }
                    }
                });
            });
        }
    });
}



// Custom Card Setting
const customCard = ()=>{
    const customCard = document.querySelectorAll('.sp-custom-card');
    const continueBtn = document.querySelector('#btn_continue');
    let answerComplteCount = 0;
    const currentLang = document.documentElement.lang; // HTML 태그의 lang 속성 가져오기
    const isRTL = currentLang === 'ar' || currentLang === 'he';

    if( continueBtn === null || continueBtn === undefined ){
        return;
    }

    // Error Check
    const errorFlag = (document.querySelectorAll('.hasError').length>=1);

    if( customCard.length === 0 ){
        return;
    }else{
        if( !errorFlag ){
            const gridList = document.querySelectorAll('.grid-list-mode');
            if( gridList.length > 0  ){
                continueBtn.disabled = true;
            }
        }else{
            continueBtn.disabled = false;
        }
    }

    const style = document.createElement('style');

    style.innerHTML = `
.sp-custom-card:not(.noCols) .answers {
    margin: 0 auto;
}

.survey-container {
  overflow: unset !important;
}

.sticky-class {
  position: sticky;
  top: 0;
  z-index: 9999;
  background-color: #fff;
}


.sp-card-arrow {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px !important;
}

.sp-card-arrow-left, .sp-card-arrow-right {
    width: 40px;
    padding: 7px;
    background-color: #2d6df6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.5s, opacity 0.5s;
}

*:lang(ar) .sp-card-arrow-left, *:lang(ar) .sp-card-arrow-right, *:lang(he) .sp-card-arrow-left, *:lang(he) .sp-card-arrow-right {
    transform: rotateY(180deg);
}

.sp-card-arrow-icon {
    width: 30px;
}

.sp-card-arrow-left:hover {
    transform: translateX(-10px);
}

.sp-card-arrow-right:hover {
    transform: translateX(10px);
}

*:lang(ar) .sp-card-arrow-left:hover, *:lang(he) .sp-card-arrow-left:hover {
    transform: rotateY(180deg) translateX(-10px);
}

*:lang(ar) .sp-card-arrow-right:hover, *:lang(he) .sp-card-arrow-right:hover {
    transform: rotateY(180deg) translateX(10px);
}

@media (max-width: 1000px) {
    .sp-custom-card .grid-list-mode {
        max-width: 750px !important;
        margin: 0 auto;
    }    
}

@media (max-width: 768px) {
    .sp-card-arrow-left:hover {
        transform: translateX(0px);
    }

    .sp-card-arrow-right:hover {
        transform: translateX(0px);
    }

    .sp-custom-card .grid-list-mode {
        max-width: 350px !important;
        margin: 0 auto;
    }
}


.sp-custom-card .grid-list-mode .row-elements th{
    text-align: center;
}

.sp-card-container {
    display: flex!important;
    overflow: hidden;
    width: 100%;
}

.sp-card-container .row-elements {
    min-width: 100%;
    transition: transform 0.3s ease;
}

.sp-card-last, .sp-card-complete {
    display: flex;
    justify-content: center;
    align-items: center;
}

.sp-card-complete svg {
    width: 80px;
    color: #2d6df6;
}

.sp-card-last {
    grid-template-columns: repeat(1, 1fr)!important;
}

.border-shadow-unset {
    border: unset !important;
    box-shadow: unset !important;
}

.group-unset {
    border-radius: unset !important;
    box-shadow: unset !important;
}

.row-margin-top-unset {
    margin-top: unset !important;
}
        `;
    document.head.appendChild(style);


    // SetUp Each Custom Card Question
    [...customCard].forEach((card)=>{
        const cardId = card.id;
        const baseRoot = card.querySelector('.grid-list-mode');

        if( baseRoot === null || baseRoot === undefined ){
            return;
        }

        if( !(card.classList.contains('radio') || card.classList.contains('checkbox')) ){
            return;
        }

        const allRows = card.querySelectorAll('.grid-list-mode .row-elements:not(.zeroHeight)');
        const baseElements = [...allRows].filter(row => row.querySelectorAll('input').length >= 1);
        const disabledElements = [...allRows].filter(row => row.querySelectorAll('input').length == 0);

        const checkMaxWidth = [...card.classList].filter((cl)=> cl.includes('card-mw-'));

        if( checkMaxWidth.length == 1 ) {
            const setMaxWidth = checkMaxWidth[0].split('-').slice(-1)[0];
            style.innerHTML += `
#${card.id}.sp-custom-card .grid-list-mode {
    max-width: ${setMaxWidth}px;
}
`;
        }else{
            style.innerHTML += `
#${card.id}.sp-custom-card .grid-list-mode {
    max-width: 924px;
}`;
        }

        style.innerHTML += `
@media (max-width: 768px) {
    #${card.id}.sp-custom-card .grid-list-mode {
        max-width: 100%;
    }
}`;


        // Answer Check
        const answerCount = [...baseElements].filter(row => row.querySelector('.fir-icon.selected')).length;
        
        const currentAnswers = answerCount >= 1;

        if( currentAnswers ){
            answerComplteCount += 1;
        }

        // Auto Next Flag;
        let nextFlag = currentAnswers ? false : true;
        

        if( card.classList.contains('able-continue') || currentAnswers ){
            continueBtn.disabled = false;
        }


        disabledElements.forEach((row)=>{
            row.classList.add('hidden');
        });


        if( errorFlag ){
            return;
        }else{
            [...allRows].forEach((row)=>{
                row.classList.add('row-margin-top-unset');
            })
        }

        // Set Next/Prev Button Element
        const navigatorContiner = document.createElement('div');
        navigatorContiner.classList.add('sp-card-arrow');

        const prevBtnIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sp-card-arrow-icon"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`
        const prevBtn = document.createElement('div');
        prevBtn.innerHTML = prevBtnIcon;
        prevBtn.classList.add('sp-card-arrow-left');

        const nextBtnIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="sp-card-arrow-icon"><path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`
        const nextBtn = document.createElement('div');
        nextBtn.innerHTML = nextBtnIcon;
        nextBtn.classList.add('sp-card-arrow-right');


        let currentIndex = currentAnswers ? answerCount : 0;

        const answerCountDiv = document.createElement('div');
        answerCountDiv.classList.add('sp-answer-count', 'animate__animated', 'animate__fast');
        answerCountDiv.innerHTML = `${currentIndex + 1}/${baseElements.length}`;

        const groupBody = document.createElement('tbody');

        groupBody.classList.add('sp-card-arrow', 'sticky-class');

        [prevBtn, answerCountDiv, nextBtn].forEach((item)=>{
          groupBody.appendChild(item);
        });

        baseRoot.insertBefore(groupBody, baseRoot.firstChild);

        const newTbody = document.createElement('tbody');
        newTbody.classList.add('sp-card-container', 'animate__animated', 'animate__fadeIn');
        baseRoot.appendChild(newTbody);

        
        // Group By row
        let setGroupElement = null;

        if ( baseRoot.dataset.settings.includes('group-by-row') ){
            const rows = baseRoot.querySelectorAll('.row');

            rows.forEach((row, index) => {
              if (row.classList.contains('row-group')) {
                setGroupElement = row.querySelector('th').cloneNode(true);
                row.parentNode.removeChild(row);
                return;
              } else {
                newTbody.appendChild(row);
                if (setGroupElement !== null) {
                    const clonedGroup = setGroupElement.cloneNode(true);
                    clonedGroup.classList.add('group-unset');
                    row.insertBefore(clonedGroup, row.firstChild);
                }
              }
            });
        }

        // Group By col
        if ( baseRoot.dataset.settings.includes('group-by-col') ){
            baseElements.forEach((row)=>{
              newTbody.appendChild(row);

              const colGroup = row.querySelector('.col-legend-group');
              if( colGroup ){
                setGroupElement = colGroup.cloneNode(true);
                return;
              }else{
                if( setGroupElement !== null ){
                    row.insertBefore(setGroupElement.cloneNode(true), row.firstChild);
                }
              }
            });
        }

        // Last Page
        const lastPage = document.createElement('tr');
        lastPage.classList.add('sp-card-last', 'row-elements');

        // Complete Element
        const completeDiv = document.createElement('div');
        lastPage.appendChild(completeDiv);
        completeDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`;

        completeDiv.classList.add('sp-card-complete', 'animate__animated');

        newTbody.appendChild(lastPage);


        const disableBtn = (btn)=>{
          btn.style.pointerEvents = 'none';
          btn.style.opacity = '0.5';  
        }

        const ableBtn = (btn)=>{
          btn.style.pointerEvents = '';
          btn.style.opacity = '1';  
        }

        const updateSlide = ()=> {
            let offset = -(currentIndex) * 100;
            const rowElementsCount = baseElements.length;

            const eachPage = [...allRows].filter(row => row.querySelectorAll('input').length >= 1);
            eachPage.push(lastPage);

            eachPage.forEach(row => {
                row.style.transform = `translateX(${isRTL ? (offset)*(-1) : offset}%)`;
            });

            const pageNumber = currentIndex + 1 <= rowElementsCount ? currentIndex + 1 : currentIndex;
            answerCountDiv.innerHTML = `${pageNumber}/${rowElementsCount}`;


            const rowElements = card.querySelectorAll('.row-elements');

            if(currentIndex + 1 > rowElementsCount){
                // Answer Complete
                answerCountDiv.classList.add('animate__flipOutX');
                answerCountDiv.classList.remove('animate__flipInX');
                newTbody.style.maxHeight = '120px';
                completeDiv.classList.add('animate__bounceIn');
                completeDiv.classList.remove('animate__fadeOut');

                answerComplteCount += 1;

                if( answerComplteCount >= customCard.length ){
                    continueBtn.disabled = false;
                    continueBtn.focus();

                    // Auto Continue
                    if( card.classList.contains('auto-continue') && !currentAnswers ){
                        continueBtn.click();
                    }
                }

                rowElements.forEach((row)=>{
                    row.classList.add('border-shadow-unset');
                });

            }else{
                answerCountDiv.classList.add('animate__flipInX');
                answerCountDiv.classList.remove('animate__flipOutX');
                newTbody.style.maxHeight = 'unset';
                completeDiv.classList.add('animate__fadeOut');
                completeDiv.classList.remove('animate__bounceIn');
                    rowElements.forEach((row)=>{
                    row.classList.remove('border-shadow-unset');
                });
            }

            nextBtnHandler();

            if( currentIndex === 0 ){
              disableBtn(prevBtn);
            }else{
              ableBtn(prevBtn);
            }
        }

        const focusNavigator = ()=>{
            card.scrollIntoView({ behavior: 'smooth', block: 'start'});
        }

        const nextBtnHandler = ()=>{
                if( currentIndex < baseElements.length ){
                const currentPage = baseElements[currentIndex].querySelector('input:checked', '.fir-icon.selected');

                if( !currentPage ){
                  disableBtn(nextBtn);
                  nextFlag = true;
                }else{
                    const questionType = currentPage.type;
                    if( questionType === 'radio' ){
                        ableBtn(nextBtn);
                    }

                    if( questionType === 'checkbox' ){
                        // Atleast Default 1
                        let atleast = [...card.classList].filter((cl)=> cl.includes('atleast-'))[0];
                        try {
                            atleast = atleast === undefined ? 1 : parseInt(atleast.split('-')[1]);
                        }
                        catch {
                            atleast = 1;
                        }

                        // AtMost Default null
                        let atmost = [...card.classList].filter((cl)=> cl.includes('atmost-'))[0];
                        try {
                            atmost = atmost === undefined ? null : parseInt(atmost.split('-')[1]);
                        }
                        catch {
                            atmost = null;
                        }

                        // Exactly Default null
                        let exactly = [...card.classList].filter((cl)=> cl.includes('exactly-'))[0];
                        try {
                            exactly = exactly === undefined ? null : parseInt(exactly.split('-')[1]);
                        }
                        catch {
                            exactly = null;
                        }

                        const multiAnswer = baseElements[currentIndex].querySelectorAll('input:checked', '.fir-icon.selected').length;

                        if( exactly ){
                            if( exactly === multiAnswer ){
                                ableBtn(nextBtn);
                            }else{
                                disableBtn(nextBtn);

                                if( currentPage.classList.contains('exclusive') ){
                                    ableBtn(nextBtn);
                                }
                            }
                        }else{
                            if( atmost ){
                                if( (atleast <= multiAnswer) && (multiAnswer <= atmost) ){
                                    ableBtn(nextBtn);
                                }else{
                                    disableBtn(nextBtn);
                                }
                            }else{
                                if( atleast <= multiAnswer ){
                                    ableBtn(nextBtn);
                                }else{
                                    disableBtn(nextBtn);
                                }
                            }

                            if( currentPage.classList.contains('exclusive') ){
                                ableBtn(nextBtn);
                            }
                        }
                    }

                    if( nextFlag ){
                        // Auto Next

                        // CheckBox
                        if( (questionType === 'checkbox' && currentPage.classList.contains('exclusive'))){
                            currentIndex++;
                            updateSlide();
                            focusNavigator();
                        }

                        // Radio
                        if(questionType === 'radio'){
                            const parentNode = currentPage.parentNode.parentNode.parentNode;
                            if( !parentNode.classList.contains('supportsOE') ){
                                currentIndex++;
                                updateSlide();
                                focusNavigator();
                            }
                        }
                    }
                }
              }else{
                disableBtn(nextBtn);
              }
        }

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                    nextFlag = false;
                currentIndex--;
                updateSlide();
                focusNavigator();
            }
        });

        nextBtn.addEventListener('click', () => {
            const eachPage = [...allRows].filter(row => row.querySelectorAll('input').length >= 1);
            if (currentIndex < eachPage.length) {
                currentIndex++;
                updateSlide();
                focusNavigator();
            }
        });

        updateSlide();

        const config = {
          attributes: true,
          attributeFilter: ['class', 'checked'],
          subtree: true,
          childList: false,
        };

        const callback = (mutationsList, observer) => {
          for (let mutation of mutationsList) {
            if (mutation.type === 'attributes' && (mutation.attributeName === 'class' || mutation.attributeName === 'checked')) {
              nextBtnHandler();
            }
          }
        };

        const observer = new MutationObserver(callback);

        baseElements.forEach((row) => {
          observer.observe(row, config);
        });
    });
}


// select year/month date with ascending/descending option
const selectDateRange = ({minDate, maxDate, descending=true, yearBase='.year-selector', monthBase='.month-selector'}) => {
  const [minYear, minMonth] = minDate.split('-').map(Number);
  const [maxYear, maxMonth] = maxDate.split('-').map(Number);

  const yearSelectors = document.querySelectorAll(yearBase);
  const monthSelectors = document.querySelectorAll(monthBase);

  yearSelectors.forEach((yearContainer, index) => {
    const yearSelector = yearContainer.querySelector('select');
    const monthSelector = monthSelectors[index].querySelector('select');

    const updateYearOptions = () => {
      const yearOpts = yearSelector.querySelectorAll('option');
      [...yearOpts].forEach((opt, idx) => {
        if (idx === 0) return;
        opt.parentNode.removeChild(opt);
      });

      // minYear부터 maxYear까지의 연도 옵션 추가
      if (descending) {
        for (let year = maxYear; year >= minYear; year--) {
            const optElement = document.createElement('option');
            optElement.value = year;
            optElement.text = year;
            yearSelector.appendChild(optElement);
        }
      }else{
        for (let year = minYear; year <= maxYear; year++) {
            const optElement = document.createElement('option');
            optElement.value = year;
            optElement.text = year;
            yearSelector.appendChild(optElement);
        }
      }
    };

    const updateMonthOptions = () => {
      const selectedYear = parseInt(yearSelector.value);
      let startMonth = 1;
      let endMonth = 12;

      if (selectedYear === minYear) {
        startMonth = minMonth;
      }
      if (selectedYear === maxYear) {
        endMonth = maxMonth;
      }

      // month-selector의 기존 옵션 제거
      const monthOpts = monthSelector.querySelectorAll('option');
      [...monthOpts].forEach((opt, idx) => {
        if (idx === 0) return; // 첫 번째 옵션은 유지 (e.g., "Select a month")
        opt.parentNode.removeChild(opt);
      });

      // 새로운 월 옵션 추가
      for (let month = startMonth; month <= endMonth; month++) {
        const optElement = document.createElement('option');
        optElement.value = String(month).padStart(2, '0');
        optElement.text = String(month).padStart(2, '0');
        monthSelector.appendChild(optElement);
      }
    };

    // 초기 설정
    updateYearOptions();
    updateMonthOptions();

    // 연도 선택 변경 시 월 옵션 업데이트
    yearSelector.addEventListener('change', updateMonthOptions);
  });
};



// sum100 drag
const fnAutosum = (_viewOrigin, _limitActivate, _dragRange, _columns, _goalValue, _minValue, _maxValue, _viewDivision, _totalText, _postText, _thisLabel) => {

  const fnAutosumStyle = () => {
    for (k = 0; k < document.querySelectorAll('style').length; k++) {
      if (document.querySelectorAll('style')[k].getAttribute('media') == null) {
        document.querySelectorAll('style')[k].innerHTML = document.querySelectorAll('style')[k].innerHTML + `
:root {
--common-shadow : 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--blue-color : #0a52ed;
--err-color : #e7046f;
--cols-border-color : #959595;
--inputBar-color : #b7ceff;
--complete-color : #b7ceff;
--sticky-color : rgba(255, 255, 255, 1);
--complete-duration : 0.3s;
--graduation-color : black;
--graduation-duration : 0.05s;
--noanswer-duration : 0.2s;
}
\@keyframes initAfter {
  0% {
    left : calc(0% - 25px);
    opacity : 0;
  }
  100% {
    left : calc(100% - 0px);
    opacity : 1;
  }
}
\@keyframes afterRotate {
  0% {
    transform : perspective(30px) rotate3d(0, 1, 0, 0deg);
  }
  100% {
    transform : perspective(30px) rotate3d(0, 1, 0, -360deg);
  }
}
body #survey {
  overflow : unset;
}
#question_${_thisLabel} .autosumWrap {
  position : relative;
  display : block;
  margin : 10px 0px 10px 0px;
  max-width : 924px;
}
#question_${_thisLabel} .autosumWrap .qaCode {
  display : inline-block;
  background-color : #3581C8;
  border : 0px solid blue;
  border-radius : 6px;
  -moz-border-radius : 6px;
  -webkit-border-radius : 6px;
  padding : 2px 4px;
  color : white;
  font-size : 11px;
  font-weight : bold;
  margin : 2px 0;
  line-height : normal;
}
#question_${_thisLabel} .autosumWrap .clickShield {
  pointer-events : none;
}
#question_${_thisLabel} .autosumWrap .newNoAnswerWrap {
  position : relative;
  display : inline-grid;
  padding : 10px;
  font-size : 15px;
  border : solid 1px #959595;
  border-radius : 10px;
  left : 50%;
  transform : translateX(-50%);
  box-shadow : 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  cursor : pointer;
  transition-duration : 0.2s;
}
\@media (hover: hover) and (pointer: fine) {
  #question_${_thisLabel} .autosumWrap .newNoAnswerWrap:hover {
    background-color : #b7ceff;
  }
}
#question_${_thisLabel} .autosumWrap .noChecked {
  background-color : #b7ceff;
}
#question_${_thisLabel} .autosumWrap .newNoAnswerInner {
  pointer-events : none;
}
#question_${_thisLabel} .autosumWrap .autosumCols {
  position : relative;
  display : grid;
  margin : 20px 0px 10px 0px;
  padding : 10px 25px 10px 25px;
  border : solid 1px #959595;
  border-radius : 10px;
  box-shadow : 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  grid-template-columns : repeat(${numGridColumn}, 1fr);
  align-items : end;
}
#question_${_thisLabel} .autosumWrap .autosumCols .autofill {
  transition-duration : 0s !important;
}
\@media (max-width: 767px) {
  #question_${_thisLabel} .autosumWrap .autosumCols {
    grid-template-columns : repeat(1, 1fr);
  }
}
#question_${_thisLabel} .autosumWrap .cHasError {
  border-color : #e7046f;
}
#question_${_thisLabel} .autosumWrap .autosumCols .completeCol {
  background-color : #b7ceff;
}
#question_${_thisLabel} .autosumWrap .autosumCols .warningCol {
  background-color : #ffff78;
}
#question_${_thisLabel} .autosumWrap .autosumColTitle {
  position : sticky;
  display : block;
  text-align : center;
  padding : 10px;
  font-size : 1.6rem;
  font-weight : bold;
  z-index : 99;
  top : 0;
  background-color : rgba(255, 255, 255, 1);
  border : solid 1px #959595;
  border-radius : 8px;
  transition-duration : 0.3s;
  grid-column : 1 / -1;
}
#question_${_thisLabel} .autosumWrap .autosumColTotal{
  position : relative;
  display : grid;
  width : 100%;
  grid-template-columns : 1fr 40px 1fr;
}
#question_${_thisLabel} .autosumWrap .autosumColTotalTitle {
  position : relative;
  height : 100%;
}
#question_${_thisLabel} .autosumWrap .autosumColTotalTitleCenterSort {
  position : relative;
  display : block;
  top : 50%;
  transform : translateY(-50%);
  text-align : left;
  float : right;
}
#question_${_thisLabel} .autosumWrap .autosumColTotalDivision {
  position : relative;
  height : 100%;
}
#question_${_thisLabel} .autosumWrap .autosumColTotalDivisionCenterSort {
  position : relative;
  display : block;
  left : 50%;
  top : 50%;
  transform : translate(-50%, -50%);
  text-align : center;
}
#question_${_thisLabel} .autosumWrap .autosumColTotalAnswer {
  position : relative;
  height : 100%;
}
#question_${_thisLabel} .autosumWrap .autosumColTotalAnswerCenterSort {
  position : relative;
  display : block;
  left : 50%;
  top : 50%;
  transform : translate(-50%, -50%);
  text-align : left;
}
#question_${_thisLabel} .autosumWrap .autosumRows {
  padding : 10px;
}
#question_${_thisLabel} .autosumWrap .autosumDragObject {
  position : relative;
  display : block;
  margin : 10px 0px 10px 0px;
  padding : 10px;
  width : 100%;
  height : 100%;
  border : solid 1px transparent;
  border-radius : 20px;
}
#question_${_thisLabel} .autosumWrap .autosumGroupWrap {
  position : relative;
  display : grid;
  border : solid 1px #959595;
  border-radius : 10px;
  grid-template-columns : repeat(${numGridColumn}, 1fr);
  grid-column : 1 / -1;
  align-items : end;
  margin : 15px 0px 15px 0px;
  overflow : hidden;
}
\@media (max-width: 767px) {
  #question_${_thisLabel} .autosumWrap .autosumGroupWrap {
    grid-template-columns : repeat(1, 1fr);
  }
}
#question_${_thisLabel} .autosumWrap .autosumGroupTitle {
  position : relative;
  display : block;
  text-align : center;
  padding : 10px;
  font-size : 1.4rem;
  font-weight : bold;
  grid-column : 1 / -1;
  align-items : center;
  transition-duration : 0.2s;
  border-bottom: 1px solid #959595;
  background-color: #d8d8d863;
}
#question_${_thisLabel} .autosumWrap .groupFocused {
  background-color : #b7ceff;
}
#question_${_thisLabel} .autosumWrap .rHasError {
  border-color : #e7046f;
  border-width : 2px;
}
#question_${_thisLabel} .autosumWrap .autosumRowViewer {
  position : relative;
  display : block;
  width : 100%;
  padding-bottom : 10px;
  font-size : 15px;
}
#question_${_thisLabel} .autosumWrap .autosumRowViewerTitle {
  position : relative;
  display : grid;
  justify-items : center;
  align-items : center;
  margin-bottom : 10px;
}
#question_${_thisLabel} .autosumWrap .autosumRowViewerTitleCenterSort {
  position : relative;
  display : block;
}
#question_${_thisLabel} .autosumWrap .autosumRowViewerAnswer {
  position : relative;
  display : block;
  width : 100%;
  height : 100%;
}
#question_${_thisLabel} .autosumWrap .autosumRowViewerAnswerCenterSort {
  position : relative;
  display : grid;
  grid-template-columns : 1fr 1fr;
  column-gap : 10px;
}
#question_${_thisLabel} .autosumWrap .autosumRowViewerAnswerCenterSort input[type=number]{
  justify-self : end;
}
#question_${_thisLabel} .autosumWrap .autosumRowViewerAnswerCenterSort .autosumRowViewerAnswerCenterSortPostText{
  justify-self : start;
}
#question_${_thisLabel} .autosumWrap .innerHandler {
  position : relative;
  display : block;
  width : 100%;
  min-height : 40px;
  cursor : pointer;
  -webkit-touch-callout : none;
  -webkit-user-select : none;
  -khtml-user-select : none;
  -moz-user-select : none;
  -ms-user-select : none;
  user-select : none;
}
#question_${_thisLabel} .autosumWrap .innerInputGraduation {
  position : absolute;
  left : 0%;
  top : 50%;
  transform : translateY(-50%);
  width : 100%;
  height : 15%;
  border-radius : 5px;
  pointer-events : none;
  background-color : black;
  opacity : 0.3;
  transition-duration : 0.05s;
  z-index : 98;
}
#question_${_thisLabel} .autosumWrap .innerInputBar {
  position : absolute;
  left : 0%;
  top : 50%;
  transform : translateY(-50%);
  width : 0%;
  height : 20%;
  pointer-events : none;
  background-color : #b7ceff;
  border-radius : 10px;
  z-index : 98;
  transition-duration : 0.1s;
}
#question_${_thisLabel} .autosumWrap .innerInputBarAfter {
  position : absolute;
  display : block;
  left : 100%;
  top : 50%;
  transform : translate(-50%, -50%);
  width : 20px;
  height : 20px;
  border : solid 1px #0a52ed;
  border-radius : 100%;
}
#question_${_thisLabel} .autosumWrap .innerInputBarAfterRound {
  position : relative;
  display : block;
  left : calc(100% - 16px);
  top : calc(100% - 16px);
  width : 14px;
  height : 14px;
  background-color : #0a52ed;
  border-radius : 100%;
}
#question_${_thisLabel} .autosumWrap .innerInputAimWrap {
  position : absolute;
  display : flex;
  flex-wrap : nowrap;
  width : 100%;
  height : 100%;
}
#question_${_thisLabel} .autosumWrap .innerInputAimPoint {
  width : 100%;
  height : 100%;
  -webkit-touch-callout : none;
  -webkit-user-select : none;
  -khtml-user-select : none;
  -moz-user-select : none;
  -ms-user-select : none;
  user-select : none;
}
#question_${_thisLabel} .errorGuideWrap {
  position : relative;
  display : block;
  margin : 2px 0px 2px 0px;
  width : 24px;
  cursor : pointer;
}
#question_${_thisLabel} .errorGuideButton {
  pointer-events : none;
}
`;
        break;
      }
    }
  }

  const fnParentSearch = (_this, _goal) => {
    let objTemp = _this;
    while (objTemp.hasAttribute('class') && !objTemp.className.includes(_goal)){
      if (objTemp.parentNode) {
        objTemp = objTemp.parentNode;
      }
      else {
        objTemp = 'null';
        break;
      }
    }
    return objTemp;
  }

  const fnDragReturn = (_target, _point, _option) => {
    if (_target) {
      try {
        const numTargetWidth = Math.floor(getComputedStyle(_target).width.split('px')[0]);
        const numTargetLeft = Math.floor(_target.getBoundingClientRect().left);
        const numPointCount = Number(_point.className.split('aimPoint_')[1].split(' ')[0]);
        const numPointWidth = Math.floor(getComputedStyle(_point).width.split('px')[0]);
        const numPointPosX = Math.floor(_point.getBoundingClientRect().left);
        const numPointCalc = numPointWidth * ((numPointCount - (_minValue)) / (_maxValue - (_minValue))).toFixed(3);
        let numPerspective;
        if (numPointCount === _minValue) {
          numPerspective = 0;
        }
        else if (numPointCount === _maxValue) {
          numPerspective = 100;
        }
        else {
          if (numPointCount % _dragRange === 0) {
            numPerspective = (Math.round((((numPointPosX + numPointCalc) - numTargetLeft) / numTargetWidth).toFixed(3) * 1000) / 1000) * 100;
          }
          else {
            return '_dragRange calc false';
          }
        }
        switch (_option) {
          case 1:
            return numPerspective;
            break;
          case 2:
            return numPointCount;
            break;
        }
      } catch (e) {
        return e;
      }
    }
    else {
      return 'None Target';
    }
  }

  const fnDragCalc = (_target, _point, _option) => {
    if (_target === objCurDragTarget) {
      try {
        if (!_point.className.includes('aimLimit')) {
          const numTargetWidth = Math.floor(getComputedStyle(_target).width.split('px')[0]);
          const numTargetLeft = Math.floor(_target.getBoundingClientRect().left);
          const numPointCount = Number(_point.className.split('aimPoint_')[1].split(' ')[0]);
          const numPointWidth = Math.floor(getComputedStyle(_point).width.split('px')[0]);
          const numPointPosX = Math.floor(_point.getBoundingClientRect().left);
          const numPointCalc = numPointWidth * ((numPointCount - (_minValue)) / (_maxValue - (_minValue))).toFixed(3);
          let numPerspective;
          if (numPointCount === _minValue) {
            numPerspective = 0;
          }
          else if (numPointCount === _maxValue) {
            numPerspective = 100;
          }
          else {
            if (numPointCount % _dragRange === 0) {
              numPerspective = (Math.round((((numPointPosX + numPointCalc) - numTargetLeft) / numTargetWidth).toFixed(3) * 1000) / 1000) * 100;
            }
            else {
              return '_dragRange calc false';
            }
          }
          fnDragCalcMarker(_target, _point);
          switch (_option) {
            case 1:
              return numPerspective;
              break;
            case 2:
              return numPointCount;
              break;
          }
        }
        else {
          let arrTempList = new Array();
          for (const tempPoint of _target.querySelectorAll('.innerInputAimPoint')) {
            if (tempPoint === _point) break;
            else {
              if (!tempPoint.className.includes('aimLimit')) {
                arrTempList.push(tempPoint);
              }
            }
          }
          if (arrTempList.length >= 1) fnDragAction(arrTempList[arrTempList.length - 1]);
        }
      } catch (e) {
        return e;
      }
    }
    else {
      return 'None Target';
    }
  }

  const fnDragCalcMarker = (_target, _point) => {
    for (const points of _target.querySelectorAll('.innerInputAimWrap .innerInputAimPoint')) {
      if (points === _point) {
        points.classList.add('aimMarker');
        if (Number(points.className.split('aimPoint_')[1].split(' ')[0]) !== _minValue) {
          bolFirstStep = true;
          const objCol = fnParentSearch(objCurDragTarget, 'autosumCols');
          objCol.classList.remove('firstStep');
        }
      }
      else {
        points.classList.remove('aimMarker');
      }
    }
  }

  const fnDragActivate = (_target, _bol) => {
    const objMainGraduation = _target.className.includes('innerHandler') ? _target.querySelector('.innerInputGraduation') : _target.parentNode.parentNode.querySelector('.innerInputGraduation');
    if (_bol) {
      objMainGraduation.style.opacity = '0.5';
    }
    else {
      objMainGraduation.style.opacity = '';
    }
  }

  const fnRoundRotation = (_bol) => {
    const objRotateTarget = objCurDragTarget.querySelector('.innerInputBarAfterRound');
    if (_bol) {
      objRotateTarget.style.animation = 'afterRotate 0.5s 1 forwards ease-out';
    }
    else {
      objRotateTarget.style.animation = '';
    }
  }

  const fnDragAction = (_point) => {
    try {
      if (objCurDragTarget) {
        if (!_point.className.includes('aimMarker')) {
          if (!isNaN(fnDragCalc(objCurDragTarget, _point, 1))) {
            fnResultUpdate(_point);
          }
        }
      }
    } catch (e) {
      console.log(e)
      return false;
    }
  }

  const fnResultTartget = (_origin, _target, _text, _point) => {
    _target.style.width = String(fnDragCalc(objCurDragTarget, _point, 1)) + '%';
    _origin.value = Number(fnDragCalc(objCurDragTarget, _point, 2));
  }

  const fnResultOrigin = (_origin, _point) => {
    _origin.value = Number(fnDragCalc(objCurDragTarget, _point, 2));
  }

  const fnResultTotal = () => {
    const objCol = fnParentSearch(objCurDragTarget, 'autosumCols');
    const objTotal = objCol.querySelector('.autosumColTotalAnswerCenterSort');
    let numTotalScore = 0;
    for (const markers of objCol.querySelectorAll('.aimMarker')) {
      const numScore = Number(markers.className.split('aimPoint_')[1].split(' ')[0]);
      numTotalScore += numScore;
    }
    objTotal.innerText = String(numTotalScore) + ' ' + _postText;
    if (_limitActivate) {
      if (!isNaN(_goalValue) && _goalValue > 0) {
        fnDragLimit(objCol, numTotalScore);
      }
    }
  }

  const fnDragLimit = (_col, _totalScore) => {
    const numTargetSubtrackt = _goalValue - _totalScore;
    for (const mark of _col.querySelectorAll('.aimMarker')) {
      const objAimWrap = mark.parentNode;
      let arrLimitList = new Array();
      let bolAimFlag = false;
      for (const point of objAimWrap.querySelectorAll('.innerInputAimPoint')) {
        point.classList.remove('aimLimit');
        if (point.className.includes('aimMarker')) bolAimFlag = true;
        else if (bolAimFlag) {
          if (_totalScore > _goalValue) {
            //console.log('totalScore Over!!');
            if (!bolAutofill) {
              point.classList.add('aimLimit');
              arrLimitList.push(point);
            }
            fnDragComplete(3);
          }
          else {
            if (_totalScore === _goalValue) {
              if (!bolAutofill) {
                point.classList.add('aimLimit');
                arrLimitList.push(point);
              }
              fnDragComplete(1);
            }
            else {
              const numPointSubtrackt = Number(point.className.split('aimPoint_')[1].split(' ')[0]) - Number(mark.className.split('aimPoint_')[1].split(' ')[0]);
              if (numPointSubtrackt > numTargetSubtrackt) {
                if (!bolAutofill) {
                  point.classList.add('aimLimit');
                  arrLimitList.push(point);
                }
              }
              fnDragComplete(2);
            }
          }
        }
      }
      const objTempDragTarget = objAimWrap.parentNode;
      const objTargetGraduation = objTempDragTarget.querySelector('.innerInputGraduation');
      if (arrLimitList.length > 0) {
        if (arrLimitList[0].previousSibling) {
          objTargetGraduation.style.width = String(fnDragReturn(objTempDragTarget, arrLimitList[0].previousSibling, 1)) + '%';
        }
      }
      else {
        objTargetGraduation.style.width = '100%';
      }
    }
  }

  const fnDragComplete = (_status) => {
    /*
    _status === 1, complete
    _status === 2, incomplete
    _status === 3, warning
    */
    fnDragShield(false);
    const objCol = fnParentSearch(objCurDragTarget, 'autosumCols');
    const objCompleteCol = objCol.querySelector('.autosumColTitle');
    if (_status === 1) {
      objCompleteCol.classList.add('completeCol');
      objCompleteCol.classList.remove('warningCol');
      fnDragShield(true);
    }
    else if (_status === 2) {
      objCompleteCol.classList.remove('completeCol');
      objCompleteCol.classList.remove('warningCol');
    }
    else if (_status === 3) {
      objCompleteCol.classList.remove('completeCol');
      objCompleteCol.classList.add('warningCol');
      fnDragShield(true);
    }
  }

  const fnDragShield = (_bol) => {
    if (!bolAutofill) {
      const objTargetCol = fnParentSearch(objCurDragTarget, 'autosumCols');
      for (const rows of objTargetCol.querySelectorAll('.autosumRows')) {
        if (_bol) {
          if (rows.querySelector('.aimMarker')) {
            const numRowValue = Number(rows.querySelector('.aimMarker').className.split('aimPoint_')[1].split(' ')[0]);
            if (numRowValue === _minValue) {
              rows.classList.add('clickShield');
            }
          }
        }
        else {
          rows.classList.remove('clickShield');
        }
      }
    }
  }

  const fnResultUpdate = (_point) => {
    const objCurWrap = objCurDragTarget.parentNode;
    const objResultText = objCurWrap.querySelector('.autosumRowViewerAnswer .autosumRowViewerAnswerCenterSort');
    const objOriginInput = document.getElementById(objCurWrap.className.split('autosumDragObject ')[1].split(' ')[0]);
    const objResultInputBar = objCurDragTarget.querySelector('.innerInputBar');
    fnResultTartget(objOriginInput, objResultInputBar, objResultText, _point);
    fnResultOrigin(objOriginInput, _point);
    fnResultTotal();
    fnNextActivate(fnResultCheck());
    if (bolAutofill) {
      fnAutofill(_point);
    }
  }

  const fnAutofill = (_point) => {
    if (objCurDragTarget) {
      if (bolInterrupt) {
        const objTargetNode = objCurDragTarget.parentNode.parentNode;
        const objAutofillCol = objTargetNode.parentNode;
        const numCalcValue = _goalValue - Number(_point.className.split('aimPoint_')[1].split(' ')[0]);
        for (const bars of objAutofillCol.querySelectorAll('.innerInputBar')) {
          bars.classList.add('autofill');
        }
        for (const rows of objAutofillCol.querySelectorAll('.autosumRows')) {
          if (rows !== objTargetNode) {
            const objTargetStorage = objCurDragTarget;
            const objAutoDragTarget = rows.querySelector('.innerHandler');
            objCurDragTarget = objAutoDragTarget;
            fnDragAction(objAutoDragTarget.querySelector('.aimPoint_' + numCalcValue));
            objCurDragTarget = objTargetStorage;
            break;
          }
        }
      }
    }
  }

  const fnResultCheck = () => {
    const numCols = document.querySelectorAll('.limitCol').length;
    const numComplete = document.querySelectorAll('.completeCol').length;
    const objSteped = document.querySelector('.firstStep');
    if (numCols === numComplete && !objSteped) {
      return true;
    }
    else {
      return false;
    }
  }

  const fnNextActivate = (_bol) => {
    const objNextBtn = document.querySelector('.survey-buttons #btn_continue');
    if (_bol) {
      objNextBtn.disabled = false;
    }
    else {
      objNextBtn.disabled = true;
    }
  }

  const fnErrScroll = (_btn, _target) => {
    if (_target) {
      const objMainScroll = document.getElementById('surveyContainer') ? document.getElementById('surveyContainer') : document.querySelector('html');
      const numTargetHeight = Number(getComputedStyle(_target).height.split('px')[0]);
      const numTargetPosY = _target.getBoundingClientRect().top;
      const numMainViewport = document.getElementById('surveyContainer') ? Number(getComputedStyle(objMainScroll).height.split('px')[0]) : window.innerHeight;
      objMainScroll.style.scrollBehavior = 'smooth';
      objMainScroll.scrollTop = (objMainScroll.scrollTop + numTargetPosY) + (numTargetHeight / 2) - (numMainViewport / 2);
    }
    else {
      _btn.remove();
    }
  }

  const fnNoanswer = (_bol, _btn) => {
    if (_bol) {
      for (const drags of document.querySelectorAll(`#question_${_thisLabel} .autosumDragObject`)) {
        const strOriginID = drags.className.split('autosumDragObject ')[1].split(' ')[0];
        const objOriginInput = document.getElementById(strOriginID);
        const objTempTarget = drags.querySelector('.innerHandler');
        const objCol = fnParentSearch(drags, 'autosumCols');
        const objColTitleAnswer = objCol.querySelector('.autosumColTotalAnswerCenterSort');
        objCurDragTarget = objTempTarget;
        const objTempPoint = objTempTarget.querySelector('.aimPoint_' + String(_minValue));
        fnDragAction(objTempPoint);
        drags.parentNode.style.pointerEvents = 'none';
        objCurDragTarget.querySelector('.innerInputGraduation').style.opacity = '0';
        objOriginInput.value = '';
        objColTitleAnswer.innerHTML = '- ' + _postText;
      }
      objCurDragTarget = undefined;
      _btn.classList.add('noChecked');
      for (const step of objQuestionWrap.querySelectorAll('.firstStep')) {
        step.className = step.className.replace('firstStep', 'stepNoanswer');
      }
      for (const cols of objQuestionWrap.querySelectorAll('.autosumColTitle')) {
        if (cols.style.display !== 'none') {
          cols.classList.add('completeCol');
        }
      }
    }
    else {
      for (const drags of document.querySelectorAll(`#question_${_thisLabel} .autosumDragObject`)) {
        const strOriginID = drags.className.split('autosumDragObject ')[1].split(' ')[0];
        const objOriginInput = document.getElementById(strOriginID);
        const objTempTarget = drags.querySelector('.innerHandler');
        let numInsertValue = _minValue;
        objCurDragTarget = objTempTarget;
        numInsertValue = _minValue;
        objOriginInput.value = _minValue;
        const objTempPoint = objTempTarget.querySelector('.aimPoint_' + numInsertValue);
        objTempPoint.classList.remove('aimMarker');
        fnDragAction(objTempPoint);
        drags.parentNode.style.pointerEvents = '';
        objCurDragTarget.querySelector('.innerInputGraduation').style.opacity = '';
      }
      objCurDragTarget = undefined;
      _btn.classList.remove('noChecked');
      for (const step of objQuestionWrap.querySelectorAll('.stepNoanswer')) {
        step.className = step.className.replace('stepNoanswer', 'firstStep');
      }
      for (const cols of objQuestionWrap.querySelectorAll('.autosumColTitle')) {
        if (cols.style.display === 'none') {
          cols.classList.add('firstStep');
        }
      }
    }
    fnNextActivate(fnResultCheck());
  }

  const fnInitSum = () => {
    if (numHasErrorCount === 0 && document.getElementById(`${_thisLabel}_error`)) {
      for (const cols of objQuestionWrap.querySelectorAll('.autosumCols')) {
        cols.classList.add('cHasError');
      }
    }
    else if (numHasErrorCount > 0 && document.getElementById(`${_thisLabel}_error`)) {
      const objErrorGuideWrap = document.createElement('div');
      const objErrorGuideSVG = document.createElement('div');
      objErrorGuideWrap.className = 'errorGuideWrap';
      objErrorGuideSVG.className = 'errorGuideButton';
      objErrorGuideWrap.ondragstart = function () { return false; };
      objErrorGuideWrap.oncontextmenu = function () { return false; };
      objErrorGuideWrap.onselectstart = function () { return false; };
      objErrorGuideWrap.onscroll = function () { return false; };
      objErrorGuideWrap.style.webkittouchCallout = "none";
      objErrorGuideSVG.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" /></svg>';
      objErrorGuideWrap.addEventListener('click', (e) => {
        fnErrScroll(e.target, objQuestionWrap.querySelector('.rHasError'));
      })
      objErrorGuideWrap.append(objErrorGuideSVG);
      document.getElementById(`${_thisLabel}_error`).append(objErrorGuideWrap);
    }
    for (const drags of document.querySelectorAll(`#question_${_thisLabel} .autosumDragObject`)) {
      const strOriginID = drags.className.split('autosumDragObject ')[1].split(' ')[0];
      const objOriginInput = document.getElementById(strOriginID);
      const objTempTarget = drags.querySelector('.innerHandler');
      let numInsertValue = _minValue;
      objCurDragTarget = objTempTarget;
      if (objOriginInput.value === '' && Number(objOriginInput.value) === 0) {
        numInsertValue = _minValue;
        objOriginInput.value = numInsertValue;
      }
      else if (Number(objOriginInput.value) < _minValue) {
        numInsertValue = _minValue;
      }
      else if (Number(objOriginInput.value) > _maxValue) {
        numInsertValue = _maxValue;
      }
      else {
        numInsertValue = Number(objOriginInput.value);
      }
      const objTempPoint = objTempTarget.querySelector('.aimPoint_' + numInsertValue);
      fnDragAction(objTempPoint);
      jQuery(objOriginInput).on('propertychange change keyup paste input', (e) => {
        if (!bolInterrupt) {
          const objTempID = e.target.id;
          objCurDragTarget = document.getElementsByClassName(objTempID)[0].querySelector('.innerHandler');
          objCurDragTarget.querySelector('.innerInputBar').style.transitionDuration = '0.1s';
          let numCheckPoint;
          for (const points of objCurDragTarget.querySelectorAll('.innerInputAimPoint')) {
            if (!points.className.includes('aimLimit')) {
              numCheckPoint = Number(points.className.split('aimPoint_')[1].split(' ')[0]);
            }
            else {
              break;
            }
          }
          let numBeforeValue = Number(e.target.value.replace(/[^-0-9]/g, ''));
          if (numBeforeValue > numCheckPoint) numBeforeValue = numCheckPoint;
          else if (numBeforeValue < _minValue) numBeforeValue = _minValue;
          e.target.value = numBeforeValue;
          fnDragAction(objCurDragTarget.querySelector('.aimPoint_' + e.target.value));
          objCurDragTarget = undefined;
        }
      });
      for (labels of drags.querySelectorAll('label')) {
        if (labels.hasAttribute('for')) labels.removeAttribute('for');
      }
    }
    objCurDragTarget = undefined;
    for (const after of document.querySelectorAll(`#question_${_thisLabel} .innerInputBarAfter`)) {
      after.style.animation = '1s cubic-bezier(0.22, 1, 0.36, 1) 0s 1 normal forwards running initAfter';
    }
  }

  const fnOEProcess = (_oe) => {
    if (_oe.hasAttribute('id')) _oe.removeAttribute('id');
    const strName = _oe.getAttribute('name');
    jQuery(_oe).on('propertychange change keyup paste input', (e) => {
      for (const oe of document.getElementsByName(strName)) {
        if (e.target !== oe){
          oe.value = e.target.value;
        }
      }
    })
  }

  const fnGroupAttention = (_target) => {
    const objCol = fnParentSearch(_target, 'autosumGroupWrap');
    const objCurGroup = objCol.querySelector('.autosumGroupTitle');
    objCurGroup.classList.add('groupFocused');
  }

  let objCurDragTarget;
  let arrInputList = new Array();
  let arrColsList = new Array();
  let arrRowsList = new Array();
  let arrGroupsList = new Array();
  let numHasErrorCount = 0;
  let bolFirstStep = _limitActivate ? true : false;
  let bolInterrupt = false;
  let bolAutofill = false;
  let bolGroups = false;
  let numGridColumn = 1;
  let strUniqueName;
  const objQuestionWrap = document.querySelector(`#question_${_thisLabel}`);
  const objQuestionAnswers = objQuestionWrap.querySelector('.answers');
  const objGridWrap = objQuestionWrap.querySelector('.grid');
  const objNoAnswer = objQuestionAnswers.querySelector('.no-answer') ? objQuestionAnswers.querySelector('.no-answer') : false;
  const bolSingleMode = objGridWrap ? false : true;
  const bolTableMode = !bolSingleMode && objGridWrap.className.includes('grid-table-mode') ? true : false;
  if (!_viewOrigin) {
    objQuestionAnswers.style.display = 'none';
  }
  for (i = 0; i < objQuestionWrap.querySelectorAll('input[type=number]').length; i++) {
    arrInputList.push(objQuestionWrap.querySelectorAll('input[type=number]')[i].id);
    if (strUniqueName === undefined) strUniqueName = objQuestionWrap.querySelectorAll('input[type=number]')[i].id.split('.')[0];
    if (!arrColsList.includes(objQuestionWrap.querySelectorAll('input[type=number]')[i].id.split('.')[1])) {
      arrColsList.push(objQuestionWrap.querySelectorAll('input[type=number]')[i].id.split('.')[1]);
    }
    if (!arrRowsList.includes(objQuestionWrap.querySelectorAll('input[type=number]')[i].id.split('.')[2])) {
      arrRowsList.push(objQuestionWrap.querySelectorAll('input[type=number]')[i].id.split('.')[2]);
    }
  }
  if (arrInputList.length >= 0) {
    // 그룹이 있는 지 없는 지를 체크해야 하는데, 처음 페이지가 로드 될 때 플랫폼에 상관 없이 grid-table-mode로 생성이 되었다가 스크린 크기에 맞춰서 grid-list-mode로 바뀌는 건지, 아니면 처음부터 플랫폼 스크린 크기에 따라서 grid-list-mode로 생성이 되는 건지 확인 필요
    // 일단은 grid-table-mode로 생성이 되었다가 스크린 크기에 맞춰서 grid-list-mode로 바뀌는 것으로 확인
    if (bolSingleMode) {
      let arrGroupNode = new Array();
      objQuestionAnswers.childNodes.forEach((cList, cIndex) => {
        if (cList.nodeType === 3 && cList.nodeValue.replaceAll('\n', '').replaceAll(' ', '').length > 0) {
          arrGroupNode.push(cList);
        }
        else if (cList.nodeType === 1 && !cList.querySelector('input[type=number]') && !cList.hasAttribute('class')) {
          arrGroupNode.push(cList);
        }
      })
      if (arrGroupNode.length > 0) {
        bolGroups = true;
        arrGroupNode.forEach((group, gIndex) => {
          arrGroupsList[gIndex] = new Object();
          arrGroupsList[gIndex].gChildren = new Array();
          if (group.nodeType === 3) {
            arrGroupsList[gIndex].gLabel = group.nodeValue.replaceAll('\n', '');
          }
          else if (group.nodeType === 1) {
            arrGroupsList[gIndex].gLabel = group.outerHTML;
          }
          let objGroupChild = group;
          while (objGroupChild.nextSibling && !arrGroupNode.includes(objGroupChild.nextSibling)) {
            objGroupChild = objGroupChild.nextSibling;
            if (objGroupChild.nodeType === 1 && objGroupChild.querySelector('input[type=number]')) {
              const objRowInput = objGroupChild.querySelector('input[type=number]');
              arrGroupsList[gIndex].gChildren.push(objRowInput.id.split('.')[2]);
            }
          }
        })
      }
    }
    else {
      if (objGridWrap.querySelector('.row-group')) { // grid-table-mode

        bolGroups = true;
        const arrGroupTag = objGridWrap.querySelectorAll('.row-group');
        arrGroupTag.forEach((group, gIndex) => {
          arrGroupsList[gIndex] = new Object();
          arrGroupsList[gIndex].gChildren = new Array();
          arrGroupsList[gIndex].gLabel = group.querySelector('th').innerHTML;
          if (arrGroupsList[gIndex].gLabel.substr(0, 1) === '\n') arrGroupsList[gIndex].gLabel = arrGroupsList[gIndex].gLabel.substr(1, arrGroupsList[gIndex].gLabel.length - 1);
          if (arrGroupsList[gIndex].gLabel.substr(arrGroupsList[gIndex].gLabel.length - 1, arrGroupsList[gIndex].gLabel.length) === '\n') arrGroupsList[gIndex].gLabel = arrGroupsList[gIndex].gLabel.substr(0, arrGroupsList[gIndex].gLabel.length - 1);
          let objGroupChild = group;
          while (objGroupChild.nextSibling && objGroupChild.nextSibling.className.includes('row-elements')) {
            objGroupChild = objGroupChild.nextSibling;
            const objRowInput = objGroupChild.querySelector('input[type=number]');
            if (objRowInput) arrGroupsList[gIndex].gChildren.push(objRowInput.id.split('.')[2]);
          }
        })
      }
      else if (objGridWrap.querySelector('.grid-list-mode .row-elements')) { // grid-list-mode
        let objFirstColumn = objGridWrap.querySelector('.grid-list-mode .row-elements');
        for (const element of objGridWrap.querySelectorAll('.grid-list-mode .row-elements')) {
          if (!element.className.includes('zeroHeight')) {
            objFirstColumn = element;
            break;
          }
        }
        objFirstColumn.querySelectorAll('.mobile-group-legend').forEach((group, gIndex) => {
          arrGroupsList[gIndex] = new Object();
          arrGroupsList[gIndex].gChildren = new Array();
          arrGroupsList[gIndex].gLabel = group.innerHTML;
          if (arrGroupsList[gIndex].gLabel.substr(0, 1) === '\n') arrGroupsList[gIndex].gLabel = arrGroupsList[gIndex].gLabel.substr(1, arrGroupsList[gIndex].gLabel.length - 1);
          if (arrGroupsList[gIndex].gLabel.substr(arrGroupsList[gIndex].gLabel.length - 1, arrGroupsList[gIndex].gLabel.length) === '\n') arrGroupsList[gIndex].gLabel = arrGroupsList[gIndex].gLabel.substr(0, arrGroupsList[gIndex].gLabel.length - 1);
          let objGroupChild = group;
          while (objGroupChild.nextSibling && objGroupChild.nextSibling.hasAttribute('headers')) {
            objGroupChild = objGroupChild.nextSibling;
            const objRowInput = objGroupChild.querySelector('input[type=number]');
            arrGroupsList[gIndex].gChildren.push(objRowInput.id.split('.')[2]);
          }
        })
      }
    }
    if (arrRowsList.length === 1) {
      _limitActivate = false;
      bolFirstStep = false;
    }
    if (_dragRange < 1 || isNaN(_dragRange) || !Number.isInteger(_dragRange)) _dragRange = 1;
    if (_columns < 1 || isNaN(_columns) || !Number.isInteger(_columns)) {
      numGridColumn = 1;
    }
    else if (_columns > arrRowsList.length) {
      numGridColumn = arrRowsList.length;
    }
    else {
      numGridColumn = _columns;
    }
    fnAutosumStyle();
    document.addEventListener('mouseup', (e) => {
      for (const focus of objQuestionWrap.querySelectorAll('.autosumGroupTitle')){
        focus.classList.remove('groupFocused');
      }
      bolInterrupt = false;
      if (objCurDragTarget) {
        fnRoundRotation(true);
        objCurDragTarget.querySelector('.innerInputBar').style.transitionDuration = '';
        if (e.target.getAttribute('class') && e.target.className.includes('innerInputAimPoint') && e.target.parentNode.parentNode === objCurDragTarget) {
          //console.log('No problem')
        }
        else {
          fnDragActivate(objCurDragTarget, false);
        }
      }
      objCurDragTarget = null;
    });
    document.addEventListener('touchend', () => {
      for (const focus of objQuestionWrap.querySelectorAll('.autosumGroupTitle')){
        focus.classList.remove('groupFocused');
      }
      bolInterrupt = false;
      if (objCurDragTarget) {
        objCurDragTarget.querySelector('.innerInputBar').style.transitionDuration = '';
        fnDragActivate(objCurDragTarget, false);
        fnRoundRotation(true);
      }
      objCurDragTarget = null;
    });
    const objAutosumWrap = document.createElement('div');
    objAutosumWrap.className = 'autosumWrap';
    document.addEventListener('mousemove', (e) => {
      try {
        if (objCurDragTarget) {
          if (objCurDragTarget !== e.target) {
            let numUseX;
            if (e.clientX < objCurDragTarget.getBoundingClientRect().left) {
              numUseX = objCurDragTarget.querySelector('.aimPoint_' + _minValue).getBoundingClientRect().left + (Number(getComputedStyle(objCurDragTarget.querySelector('.aimPoint_' + _minValue)).width.split('px')[0]) / 2);
            }
            else if (e.clientX > objCurDragTarget.getBoundingClientRect().left + Number(getComputedStyle(objCurDragTarget).width.split('px')[0])) {
              numUseX = objCurDragTarget.querySelector('.aimPoint_' + _maxValue).getBoundingClientRect().left + (Number(getComputedStyle(objCurDragTarget.querySelector('.aimPoint_' + _maxValue)).width.split('px')[0]) / 2);
            }
            else {
              numUseX = e.clientX;
            }
            const objPointOver = document.elementFromPoint(numUseX, objCurDragTarget.getBoundingClientRect().top + (objCurDragTarget.getBoundingClientRect().height / 2));
            fnDragAction(objPointOver);
          }
        }
      } catch (e) {
        return e;
      }
    })
    if (arrRowsList.length === 2 && _limitActivate && _goalValue === (_maxValue + _minValue)) bolAutofill = true;
    arrColsList.forEach((col, cIndex) => {
      const objAutosumCol = document.createElement('div');
      const objAutosumColTitle = document.createElement('div');
      const objAutosumColName = document.createElement('div');
      const objAutosumColTotal = document.createElement('div');
      const objAutosumColTotalTitle = document.createElement('div');
      const objAutosumColTotalDivision = document.createElement('div');
      const objAutosumColTotalAnswer = document.createElement('div');
      const objAutosumColTotalTitleCenterSort = document.createElement('div');
      const objAutosumColTotalDivisionCenterSort = document.createElement('div');
      const objAutosumColTotalAnswerCenterSort = document.createElement('div');
      let strColTitle;
      if (bolSingleMode) {
        strColTitle = '';
      }
      else {
        if (bolTableMode) {
          strColTitle = objGridWrap.querySelector('tbody').querySelectorAll('tr')[1].querySelectorAll('th')[cIndex].innerHTML;
        }
        else {
          if (objGridWrap.querySelector('tbody').querySelectorAll('tr')[cIndex + 2] && objGridWrap.querySelector('tbody').querySelectorAll('tr')[cIndex + 2].querySelector('th')) {
            strColTitle = objGridWrap.querySelector('tbody').querySelectorAll('tr')[cIndex + 2].querySelector('th').innerHTML;
          }
          else {
            strColTitle = objGridWrap.querySelector('tbody').querySelectorAll('th')[cIndex].innerHTML;
          }
        }
      }
      objAutosumCol.className = 'autosumCols autosumCol_' + col;
      if (!bolFirstStep) objAutosumCol.classList.add('firstStep');
      if (_limitActivate) objAutosumCol.classList.add('limitCol');
      objAutosumColTitle.className = 'autosumColTitle';
      objAutosumColName.className = 'autosumColName';
      objAutosumColTotal.className = 'autosumColTotal';
      objAutosumColTotalTitle.className = 'autosumColTotalTitle';
      objAutosumColTotalDivision.className = 'autosumColTotalDivision';
      objAutosumColTotalAnswer.className = 'autosumColTotalAnswer';
      objAutosumColTotalTitleCenterSort.className = 'autosumColTotalTitleCenterSort';
      objAutosumColTotalDivisionCenterSort.className = 'autosumColTotalDivisionCenterSort';
      objAutosumColTotalAnswerCenterSort.className = 'autosumColTotalAnswerCenterSort';
      objAutosumColName.innerHTML = strColTitle;
      if (bolSingleMode) objAutosumColName.style.display = 'none';
      if (bolSingleMode && !_limitActivate) objAutosumColTitle.style.display = 'none';
      objAutosumColTotal.style.display = (arrRowsList.length <= 1 || !_limitActivate) ? 'none' : '';
      objAutosumColTotalTitleCenterSort.innerText = _totalText;
      objAutosumColTotalDivisionCenterSort.innerText = _viewDivision;
      objAutosumColTotalAnswerCenterSort.innerText = '0' + ' ' + _postText;
      objAutosumColTotalTitle.append(objAutosumColTotalTitleCenterSort);
      objAutosumColTotalDivision.append(objAutosumColTotalDivisionCenterSort);
      objAutosumColTotalAnswer.append(objAutosumColTotalAnswerCenterSort);
      objAutosumColTotal.append(objAutosumColTotalTitle);
      objAutosumColTotal.append(objAutosumColTotalDivision);
      objAutosumColTotal.append(objAutosumColTotalAnswer);
      objAutosumColTitle.append(objAutosumColName);
      objAutosumColTitle.append(objAutosumColTotal);
      objAutosumCol.append(objAutosumColTitle);
      objAutosumWrap.append(objAutosumCol);
      if (bolGroups) {
        arrGroupsList.forEach((group, gIndex) => {
          const objAutosumGroupWarp = document.createElement('div');
          const objAutosumGroupTitle = document.createElement('div');

          objAutosumGroupWarp.className = 'autosumGroupWrap group_' + gIndex;
          objAutosumGroupTitle.className = 'autosumGroupTitle';

          if (arrGroupsList[gIndex].gLabel.length > 0) {
            objAutosumGroupTitle.innerHTML = arrGroupsList[gIndex].gLabel;
          }
          else {
            objAutosumGroupTitle.style.disaply = 'none';
          }
          objAutosumGroupWarp.append(objAutosumGroupTitle);
          objAutosumCol.append(objAutosumGroupWarp);
        })
      }
      arrRowsList.forEach((row, rIndex) => {
        const objAutosumRow = document.createElement('div');
        const objAutosumRowDragObject = document.createElement('div');
        const objAutosumRowViewerWrap = document.createElement('div');
        const objAutosumRowViewer = document.createElement('div');
        const objAutosumRowViewerTitle = document.createElement('div');
        const objAutosumRowViewerTitleCenterSort = document.createElement('div');
        const objAutosumRowViewerAnswer = document.createElement('div');
        const objAutosumRowViewerAnswerCenterSort = document.createElement('div');
        const objAutosumRowViewerAnswerCenterSortPostText = document.createElement('div');
        const objInnerHandler = document.createElement('div');
        const objInnerInputGraduation = document.createElement('div');
        const objInnerInputBar = document.createElement('div');
        const objInnerInputBarAfter = document.createElement('div');
        const objInnerInputBarAfterRound = document.createElement('div');
        const objInnerInputAimWrap = document.createElement('div');
        const objOriginInputTag = document.getElementById(strUniqueName + '.' + col + '.' + row);
        let strViewerTitle;
        if (bolTableMode) {
          if (!objQuestionAnswers.querySelectorAll('tbody')[1]) strViewerTitle = '';
          else strViewerTitle = objQuestionAnswers.querySelectorAll('tbody')[1].querySelectorAll('.row-elements')[rIndex].querySelector('th').innerHTML;
        }
        else {
          if (objOriginInputTag.parentNode.parentNode.querySelector('.cell-text')) {
            if (document.getElementById(`${_thisLabel}_r` + (rIndex + 1) + '_left')) {
              strViewerTitle = document.getElementById(`${_thisLabel}_r` + (rIndex + 1) + '_left').innerHTML;
            }
            else {
              strViewerTitle = objOriginInputTag.parentNode.parentNode.querySelector('.cell-text').innerHTML;
            }
          }
          else {
            strViewerTitle = '';
          }
        }
        const bolHasError = objOriginInputTag.parentNode.parentNode.parentNode.className.includes('hasError') ? true : false;
        objAutosumRow.className = 'autosumRows autosumRow_' + row;
        objAutosumRowDragObject.className = 'autosumDragObject ' + objOriginInputTag.id;
        objAutosumRowViewerWrap.className = 'autosumRowViewerWrap';
        objAutosumRowViewer.className = 'autosumRowViewer';
        objAutosumRowViewerTitle.className = 'autosumRowViewerTitle';
        objAutosumRowViewerTitleCenterSort.className = 'autosumRowViewerTitleCenterSort';
        objAutosumRowViewerAnswer.className = 'autosumRowViewerAnswer';
        objAutosumRowViewerAnswerCenterSort.className = 'autosumRowViewerAnswerCenterSort';
        objAutosumRowViewerAnswerCenterSortPostText.className = 'autosumRowViewerAnswerCenterSortPostText';
        objInnerHandler.className = 'innerHandler';
        objInnerInputGraduation.className = 'innerInputGraduation';
        objInnerInputBar.className = 'innerInputBar';
        objInnerInputBarAfter.className = 'innerInputBarAfter';
        objInnerInputBarAfterRound.className = 'innerInputBarAfterRound';
        objInnerInputAimWrap.className = 'innerInputAimWrap';
        for (i = _minValue; i <= _maxValue; i++) {
          if (i === _minValue || i === _maxValue || i % _dragRange === 0) {
            const objInnerInputAimPoint = document.createElement('span');
            objInnerInputAimPoint.className = 'innerInputAimPoint aimPoint_' + i;
            objInnerInputAimWrap.append(objInnerInputAimPoint);
          }
        }
        if (bolHasError) {
          objAutosumRowDragObject.classList.add('rHasError');
          numHasErrorCount++;
        }
        objAutosumRowViewer.style.display = objOriginInputTag.parentNode.parentNode.querySelector('.cell-text') ? '' : 'block';
        objAutosumRowViewerTitle.style.display = objOriginInputTag.parentNode.parentNode.querySelector('.cell-text') ? '' : 'None';
        if (_postText.length === 0) {
          objAutosumRowViewerAnswerCenterSort.style.display = 'flex';
          objAutosumRowViewerAnswerCenterSort.style.justifyContent = 'center';
        } 
        objInnerHandler.ondragstart = function () { return false; };
        objInnerHandler.oncontextmenu = function () { return false; };
        objInnerHandler.onselectstart = function () { return false; };
        objInnerHandler.onscroll = function () { return false; };
        objInnerHandler.style.webkittouchCallout = "none";
        objAutosumRowViewerTitleCenterSort.innerHTML = strViewerTitle;
        objAutosumRowViewerAnswerCenterSort.appendChild(objOriginInputTag);
        objAutosumRowViewerAnswerCenterSortPostText.innerHTML = _postText;
        if (objAutosumRowViewerTitleCenterSort.querySelector('input[type=text]')){
          fnOEProcess(objAutosumRowViewerTitleCenterSort.querySelector('input[type=text]'));
        }
        if (_dragRange !== 1) objOriginInputTag.readOnly = true;
        objInnerInputBarAfter.addEventListener('animationend', (e) => {
          if (objInnerInputBarAfter === e.target) {
            e.target.style.animation = '';
            objInnerHandler.addEventListener('mouseover', (e) => {
              if (!objCurDragTarget) fnDragActivate(e.target, true);
            })
            objInnerHandler.addEventListener('mouseleave', (e) => {
              if (!objCurDragTarget) fnDragActivate(e.target, false);
            })
            objInnerHandler.addEventListener('mousedown', (e) => {
              e.stopPropagation();
              bolInterrupt = true;
              if (objCurDragTarget === undefined || objCurDragTarget === null) {
                if (e.which === 1) {
                  objCurDragTarget = e.target.parentNode.parentNode;
                  fnDragAction(e.target);
                  fnRoundRotation(false);
                }
              }
            });
            objInnerHandler.addEventListener('mousemove', (e) => {
              e.stopPropagation();
              if (objCurDragTarget) {
                objCurDragTarget.querySelector('.innerInputBar').style.transitionDuration = '0s';
                if (bolGroups) fnGroupAttention(e.target);
                if (objCurDragTarget === e.target.parentNode.parentNode) {
                  fnDragAction(e.target);
                  fnDragActivate(e.target, true);
                }
                else {
                  let objPointOver;
                  if (e.target.parentNode.getBoundingClientRect().left < objCurDragTarget.getBoundingClientRect().left) {
                    objPointOver = document.elementFromPoint(objCurDragTarget.querySelector('.aimPoint_' + _minValue).getBoundingClientRect().left + (Number(getComputedStyle(objCurDragTarget.querySelector('.aimPoint_' + _minValue)).width.split('px')[0]) / 2), objCurDragTarget.getBoundingClientRect().top + (objCurDragTarget.getBoundingClientRect().height / 2));
                  }
                  else if (e.target.parentNode.getBoundingClientRect().left > objCurDragTarget.getBoundingClientRect().left) {
                    objPointOver = document.elementFromPoint(objCurDragTarget.querySelector('.aimPoint_' + _maxValue).getBoundingClientRect().left + (Number(getComputedStyle(objCurDragTarget.querySelector('.aimPoint_' + _maxValue)).width.split('px')[0]) / 2), objCurDragTarget.getBoundingClientRect().top + (objCurDragTarget.getBoundingClientRect().height / 2));
                  }
                  else {
                    objPointOver = document.elementFromPoint(e.clientX, objCurDragTarget.getBoundingClientRect().top + (objCurDragTarget.getBoundingClientRect().height / 2));
                  }
                  fnDragAction(objPointOver);
                }
              }
            });
            objInnerHandler.addEventListener('touchstart', (e) => {
              if (e.type === 'touchstart' && e.cancelable) {
                e.preventDefault();
                e.stopPropagation();
                bolInterrupt = true;
                if (objCurDragTarget === undefined || objCurDragTarget === null) {
                  objCurDragTarget = e.target.parentNode.parentNode;
                  fnDragAction(e.touches[0].target);
                  fnRoundRotation(false);
                }
                fnDragActivate(e.target, false);
              }
            });
            objInnerHandler.addEventListener('touchmove', (e) => {
              if (e.type === 'touchmove' && e.cancelable) {
                e.preventDefault();
                e.stopPropagation();
                if (objCurDragTarget) {
                  objCurDragTarget.querySelector('.innerInputBar').style.transitionDuration = '0s';
                  if (bolGroups) fnGroupAttention(objCurDragTarget);
                  let numUseX;
                  if (e.touches[0].clientX < objCurDragTarget.getBoundingClientRect().left) numUseX = objCurDragTarget.getBoundingClientRect().left;
                  else if (e.touches[0].clientX > objCurDragTarget.getBoundingClientRect().left + Number(getComputedStyle(objCurDragTarget).width.split('px')[0])) numUseX = objCurDragTarget.getBoundingClientRect().left + Number(getComputedStyle(objCurDragTarget).width.split('px')[0]) - 0.2;
                  else numUseX = e.touches[0].clientX;
                  const objViewportTouched = document.elementFromPoint(numUseX, objCurDragTarget.getBoundingClientRect().top + (objCurDragTarget.getBoundingClientRect().height / 2));
                  fnDragActivate(e.target, true);
                  fnDragAction(objViewportTouched);
                }
              }
            });
          }
        })
        objAutosumRowViewerTitle.append(objAutosumRowViewerTitleCenterSort);
        if (_postText.length > 0) objAutosumRowViewerAnswerCenterSort.append(objAutosumRowViewerAnswerCenterSortPostText);
        objAutosumRowViewerAnswer.append(objAutosumRowViewerAnswerCenterSort);
        objAutosumRowViewer.append(objAutosumRowViewerTitle);
        objAutosumRowViewer.append(objAutosumRowViewerAnswer);
        objAutosumRowDragObject.append(objAutosumRowViewer);
        objInnerHandler.append(objInnerInputGraduation);
        objInnerInputBarAfter.append(objInnerInputBarAfterRound);
        objInnerInputBar.append(objInnerInputBarAfter);
        objInnerHandler.append(objInnerInputBar);
        objInnerHandler.append(objInnerInputAimWrap);
        objAutosumRowDragObject.append(objInnerHandler);
        objAutosumRow.append(objAutosumRowDragObject);
        objAutosumCol.append(objAutosumRow);
        if (bolGroups) {
          arrGroupsList.forEach((group, gIndex) => {
            if (group.gChildren.includes(String(row))) {
              objAutosumRow.parentNode.querySelector('.group_' + gIndex).append(objAutosumRow);
            }
          })
        }
      })
    })
    objQuestionWrap.append(objAutosumWrap);
    fnInitSum();
    if (objNoAnswer) {
      const strNoText = bolSingleMode ? objNoAnswer.parentNode.parentNode.querySelector('label').innerHTML : objGridWrap.querySelector('.row-no-answer th').innerHTML;
      const objNewNoAnswerWrap = document.createElement('div');
      const objNewNoAnswerInner = document.createElement('div');
      objNewNoAnswerWrap.className = 'newNoAnswerWrap';
      objNewNoAnswerInner.className = 'newNoAnswerInner';
      objNewNoAnswerInner.innerHTML = strNoText;
      objNewNoAnswerWrap.ondragstart = function () { return false; };
      objNewNoAnswerWrap.oncontextmenu = function () { return false; };
      objNewNoAnswerWrap.onselectstart = function () { return false; };
      objNewNoAnswerWrap.onscroll = function () { return false; };
      objNewNoAnswerWrap.style.webkittouchCallout = "none";
      objNewNoAnswerWrap.addEventListener('click', (e) => {
        objNoAnswer.click();
      });
      jQuery(objNoAnswer).on('propertychange change input', (e) => {
        fnNoanswer(e.target.checked, objNewNoAnswerWrap);
      });
      objNewNoAnswerWrap.append(objNewNoAnswerInner);
      objAutosumWrap.append(objNewNoAnswerWrap);
      if (objNoAnswer.checked) fnNoanswer(objNoAnswer.checked, objNewNoAnswerWrap);
    }
  }
}


// This Or That
const ThisOrThat = ()=>{
  const thisOrThis = document.querySelectorAll('.this-or-that');
  const swichRow = (base) => {
    const [baseName, baseDelimiter] = base.split('-');
    const swichDelimiter = baseDelimiter === 'this' ? 'that' : baseDelimiter === 'that' ? 'this' : null;
    const setClassName = baseName+'-'+swichDelimiter;
    const currInput = document.querySelectorAll('.'+base+' input[type=checkbox]');
    const disableInput = document.querySelectorAll('.'+setClassName);
    const inputCheckFlag = [...currInput].filter((ip)=> ip.checked);
    if( inputCheckFlag.length >= 1 ){
      disableInput.forEach( (item)=>{
        const firIcon = item.querySelector('.fir-icon');
        firIcon.classList.remove('selected');
        const currInput = item.querySelector('input[type=checkbox]');
        currInput.checked = false;

        item.style.opacity = '0.5';
        item.style.pointerEvents = 'none';
      });
    }else{
      disableInput.forEach( (item)=>{
        item.style.opacity = '1';
        item.style.pointerEvents = '';
      });
    }
  }

  const executeFnc = ()=>{
    thisOrThis.forEach( (row) =>{
      const [baseClass] = [...row.classList].filter( (item) =>  item.includes('base'));
      swichRow(baseClass);
    });
  }

  thisOrThis.forEach( (row) =>{
    const [baseClass] = [...row.classList].filter( (item) =>  item.includes('base'));
    row.addEventListener('click', ()=>{
      swichRow(baseClass);
    });
  });

  const answers = document.querySelector('.answers');
  answers.onchange = ()=>{
    executeFnc();
  };
  executeFnc();
}



