const setMinHeightForColBtn = ()=>{
    const rankTextElements = document.querySelectorAll('.sp-btn-container');
    let maxHeight = 0;
    
    if( [...rankTextElements].length > 0 ){
        rankTextElements.forEach(element => {
            element.style.minHeight = '0';
        });

        rankTextElements.forEach(element => {
            if (element.offsetHeight > maxHeight) {
                maxHeight = element.offsetHeight;
            }
        });

        rankTextElements.forEach(element => {
            element.style.minHeight = maxHeight + 'px';
            if(maxHeight < 50){
                element.style.minHeight = '50px';
            }
        });
    }
}

const classHandler = (cond, className, addClass) => {
    const splitClass = className.split(" ");
    if(cond){
        splitClass.push(addClass);
        return splitClass.join(" ");
    }else{
        return className;
    }
}

const ColButton = ({uid, row, col, ansUpdate, mouseOverEvent, mouseOutEvent, autoNumber, qaShow, grouping, errRow=[], errCol=[]})=>{
    const {text, index} = col;
    const inputName = grouping === "rows" ? `ans${uid}.0.${row.index}` : `ans${uid}.${row.index}.0`;
    const inputID = `ans${uid}.${index}.${row.index}`;

    return (
        <div className={`sp-btn-container sp-btn-${row.label}-${col.label}`}>
            <input type="radio" name={inputName} value={index} id={inputID} style={{display: "none"}} checked={col.index == row.answer ? true : false}></input>
            <label className={classHandler(errCol.includes(String(col.index)) && errRow.includes(String(row.index)), classHandler(col.scoreText === null, "sp-col-btn", "sp-col-center"), "error-focus") } htmlFor={inputID} onClick={ansUpdate} onMouseOver={mouseOverEvent} onMouseOut={mouseOutEvent} onTouchStart={mouseOverEvent} onTouchEnd={mouseOutEvent}>
                {qaShow ? (<p className="qaCode-label">[{col.label}]</p>) : null}
                {autoNumber ? (
                        <div className={"sp-col-btn-text"}>
                            {col.scoreText !== null ? (<p className={"sp-col-score"} dangerouslySetInnerHTML={{__html: col.scoreText}}></p>) : null}
                            {col.text !== null ? (<p className={"sp-col-label"} dangerouslySetInnerHTML={{__html: col.text}}></p>) : null}
                        </div>
                    ) : (
                    <div>
                        <p dangerouslySetInnerHTML={{__html: col.text != null ? col.text : `(${col.value})`}}></p>
                    </div>)}
            </label>
        </div>
    )
}

const SetLeftRight = ({json, mode, left, right, answers, hold=0.5, flexDirection="row", disableContinue=true, autoContinue=false, showArrow=false, autoNumber, showGroup=false, groupInfo={}})=>{
    const brandColor = "#2d6df6";
    const brandSubColor = "#b7ceff";
    const errorColor = "#e7046f"
    let {uid, cols, rows, haveRightLegend, grouping, errors} = json;
    if( grouping === "cols" ){
        const copy_rows = rows
        const copy_cols = cols

        rows = copy_cols;
        cols = copy_rows;
    }

    const bothLegend = (haveRightLegend) || (left !== '' && right !== '');
    const smallFont = (bothLegend) && cols.length > 7

    const [errRows, setErrRows] = React.useState(errors.map((err)=>{
        const errProp = err[1];
        if ( errProp === "cell" ){
            const [errText, errProp, errColIndex, errRowIndex] = err;
            return String(errRowIndex);
        }
        
        if( errProp === (grouping === "cols" ? "col" : "row")){
            const [errText, errProp, errRowIndex] = err;
            return String(errRowIndex);
        }
    }).filter(element=>element));

    const [errCols, setErrCols] = React.useState(errors.map((err)=>{
        const errProp = err[1];
        if( errProp === "cell" ){
            const [errText, errProp, errColIndex, errRowIndex] = err;
            return String(errColIndex);
        }
        
        if( errProp === (grouping === "cols" ? "row" : "col") ){
            const [errText, errProp, errColIndex] = err;
            return String(errColIndex);
        }
    }).filter(element=>element));

    const [errRowLegends, setrrRowLegends] = React.useState(errors.map((err)=>{
        const [errText, errProp, errColIndex, errRowIndex] = err;
        if( errProp === 'row-legend' || errProp === "cell" ){
            return String(errRowIndex);
        }
    }).filter(element=>element));

    // console.log(errRows);
    // console.log(errCols);
    // console.log(errRowLegends);


    let colDirection = bothLegend ? 'row' : flexDirection;

    const colSeparator = Math.floor(cols.length/2);
    const leftCols = cols.slice(0, colSeparator).map((col)=>{return col.index});
    const rightCols = cols.slice(cols.length%2 > 0 ? colSeparator+1 : colSeparator, cols.length).map((col)=>{return col.index});

    /* Default Answers */
    rows.forEach((row)=>{
        row['answer'] = answers[row.label];
    });

    const [elRows, setElRows] = React.useState(rows);
    const currAnswer = elRows.filter((row)=>row.answer != 'null');
    /* 
        Answer Row Index 
        Default : 0;
    */
    
    const [ansIndex, setAnsIndex] = React.useState(currAnswer.length);
    const [answer, setAnswer] = React.useState(elRows.map((row)=>{
        if(row.answer == 'null'){
            return 'null';
        }else{
            return row.answer;
        }
    }));
    
    const currentLang = document.documentElement.lang; // HTML 태그의 lang 속성 가져오기
    const isRTL = currentLang === 'ar' || currentLang === 'he';
    
    const [offset, setOffset] = React.useState(-(ansIndex) * 100);


    const [autoNext, setAutoNext] = React.useState(true);
    const [leftFlag, setLeftFlag] = React.useState(false);
    const [rightFlag, setRightFlag] = React.useState(false);

    const containerRef = React.useRef(null);

    const pageOnClick = (calValue)=>{
        const currIndex = ansIndex;
        setAnsIndex(currIndex+(calValue));
    }

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const cards = Array.from(container.querySelectorAll('.sp-card'));
        if (cards.length === 0) return;

        const updateMinHeight = () => {
            let maxHeight = 0;
            cards.forEach(card => {
                maxHeight = Math.max(maxHeight, card.offsetHeight);
            });
            container.style.minHeight = `${maxHeight+40}px`;
        };

        const resizeObserver = new ResizeObserver(entries => {
            updateMinHeight();
        });

        cards.forEach(card => resizeObserver.observe(card));

        updateMinHeight();

        return () => {
            resizeObserver.disconnect();
        };
    }, [containerRef]);


    const [answerComplete, setAnswerComplete] = React.useState(false);

    const focusTop = ()=>{
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const hasError = document.querySelector('.hasError');
    const hasErrorFlag = (hasError === undefined || hasError === null);

    const speedingHandle = () => {
        const containers = document.querySelectorAll('.sp-col-btn-box');

        if ((hold !== undefined) && (hold !== null) && (hold > 0)) {
            const speeding = 'speeding-handle';
            containers.forEach((container) => {
                const input = container.querySelector('input:checked');
                if (!input) {
                    container.classList.add(speeding);
                }
            });

            // Remove the 'speeding-handle' class after the specified time
            setTimeout(() => {
                containers.forEach(container => container.classList.remove(speeding));
            }, hold * 1000);
        }
    };

    const answerUpdate = (setIndex, ans) => {
        const newAnswer = [...answer];
        const answerChageFlag = newAnswer[setIndex] !== ans;
        newAnswer[setIndex] = ans;
        setAnswer(newAnswer);
    
        const newElRows = elRows.map((row, index) => {
            if(answerChageFlag && ["up", "down"].includes(mode) && index > setIndex) {
                return { ...row, answer: "null" };
            }else if (index === setIndex) {
                return { ...row, answer: ans };
            }
            return row;
        });

        setElRows(newElRows);
        if( autoNext && hasErrorFlag ){
            setAnsIndex(ansIndex + 1);
            speedingHandle();
        }

        if( hasErrorFlag ){
            // containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            focusTop();
        }
    }
    
    React.useEffect(()=>{
        const currAnswer = [...answer];

        const filtAnswer = currAnswer.filter((row)=> row == 'null');

        if( filtAnswer.length == 0 ){
            setAnswerComplete(true);
        }else{
            setAnswerComplete(false);
        }
    }, [answer])

    
    React.useEffect(()=>{
        setOffset(-(ansIndex)*100);
    }, [ansIndex]);

    React.useEffect(()=>{
        const continueBtn = document.querySelector('#btn_continue');
        if( continueBtn !== undefined && continueBtn !== null ){
            if( answerComplete ){
                continueBtn.style.opacity = "1";
                continueBtn.style.pointerEvents = "auto";

                const hasError = document.querySelector('.hasError');
                if( hasError === null ){
                    continueBtn.focus();
                    if( autoContinue ){
                        continueBtn.click();
                    }
                }
            }else{
                if( disableContinue ){
                    continueBtn.style.opacity = "0.5";
                    continueBtn.style.pointerEvents = "none";
                }
            }
        }

    }, [answerComplete]);



    const hoverEvent = (index, flag)=>{
        const hasError = document.querySelector('.hasError');
        let hoverFlag = flag;
        if( hasError !== null){
            hoverFlag = false;
        }
        if( leftCols.includes(index) ){
            setLeftFlag(hoverFlag);
        }

        if( rightCols.includes(index) ){
            setRightFlag(hoverFlag);
        }
    }


    // QA Codes On
    const [qaShow, setQaShow] = React.useState(false);
    React.useEffect(()=>{
        setMinHeightForColBtn();
        window.addEventListener('resize', setMinHeightForColBtn);
        // QA Code On
        const qaCodes = document.querySelectorAll('.qaCode');
        const controlBar = document.querySelector('.controlbarContainer');

        if( controlBar && qaCodes.length > 0 ){
            setQaShow(true);
        }

    }, []);

    const showError = document.querySelector('.hasError') ? true : false;



    return (
        <>
        <div ref={containerRef} className="focus-zone"></div>
        <div>
            <style jsx="true">{`
.sp-question {
    max-width: 924px;
}

.qaCode-label {
    font-weight: bold;
}

#btn_continue {
    transition: opacity 0.5s;
}

.sp-container {
    overflow: ${showError ? 'unset' : 'hidden'};
}

.sp-col-legend-box, .sp-row-legend {
    width: 100%;
    display: flex;
    justify-content: space-between;
    transition: transform 0.3s;
}

.sp-col-left-right {
    width: 100%;
    display: flex;
    transition: transform 0.3s;
    margin-top: 5px;
    gap: 10px;
}

.sp-col-legend {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 5px;
    padding: 5px;
}

.sp-col-legend {
    font-weight: bold;
    transition: background-color 0.3s;
}

.sp-row-card {
    min-height: 100px;
    background-color: #fff;
    text-align: center;
}

.sp-btn-container {
    display: flex;
    width: 100%;
}

.sp-col-btn-box {
    display: flex;
    flex-direction: ${colDirection};
    align-items: stretch;
    width: 100%;
}

.sp-col-btn {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: ${colDirection === "row" ? (smallFont ? "center" : "flex-start") : "center"};
    align-items: center;
    font-size: 1.1rem;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 5px;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.5s;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.sp-col-btn-text {
    width: 100%;
}

.sp-col-center {
    justify-content: center;
}

.sp-col-score {
    font-weight: bold;
    font-size: 1rem;
}

.sp-col-label {
    width: 100%;
}

.sp-col-btn:hover {
    background-color: ${brandSubColor};
}
 
.sp-row-container {
    min-height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
}

.sp-btn-container input:checked + label {
    background-color: ${brandColor};
    color: #fff;
}

.sp-row {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 1.3rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    text-align: center;
    width: 100%;
    margin: 5px;
    min-height: 100px;
}

.sp-row-left, .sp-row-right {
    font-size: 1.3rem;
    padding: 10px;
    text-align: center;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}


.sp-row-left p, .sp-row-right p {
    word-break: break-word;    
}

.sp-row-inputs {
    display: none;
}

.sp-card-container {
    display: flex;
    flex-direction: ${showError ? 'column' : 'row'};
    transition: opacity 0.3s;
}

.sp-card {
    min-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease;
}

.z-up {
    z-index: 99999;
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

.sp-arrow-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px 0 5px;
}

.sp-arrow-left, .sp-arrow-right {
    width: 40px;
    padding: 7px;
    background-color: ${brandColor};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.5s, opacity 0.5s;
}

*:lang(ar) .sp-arrow-left, *:lang(ar) .sp-arrow-right, *:lang(he) .sp-arrow-left, *:lang(he) .sp-arrow-right {
    transform: rotateY(180deg);
}

.sp-arrow-left:hover {
    transform: translateX(-10px);
}

.sp-arrow-right:hover {
    transform: translateX(10px);
}


*:lang(ar) .sp-arrow-left:hover, *:lang(he) .sp-arrow-left:hover {
    transform: rotateY(180deg) translateX(-10px);
}

*:lang(ar) .sp-arrow-right:hover, *:lang(he) .sp-arrow-right:hover {
    transform: rotateY(180deg) translateX(10px);
}



@media (max-width:920px) {
    .sp-question {
        max-width: 750px;
    }
}


.sp-answer-count {
    font-size: 1rem;
}

.sp-answer-count.hide {
    display: none;
    pointer-events: none;
}

.sp-arrow-icon {
    width: 30px;
}

.sp-rating {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    pointer-events: auto;
}


.arrow-container {
    height: 8px;
    width: 90%;
    position: relative;
    display: flex;
    margin-top: 15px;
    margin-bottom: 10px;
    justify-content: space-between;
    align-items: center;
    background-color: ${brandColor};
}

.arrow-left, .arrow-right {
    position: relative;
    width: 0;
    height: 0;
    border-left: 30px solid transparent;
    border-right: 30px solid transparent;
}

.arrow-left::after, .arrow-right::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    top: -10px;
    left: -15px;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-bottom: 26px solid ${brandColor};
}

.arrow-left {
    transform: translateX(-25px) translateY(0.5px);
}
.arrow-left::after {
    transform: rotateZ(150deg);
}

.arrow-right {
    transform: translateX(25px) translateY(0.5px);
}
.arrow-right::after {
    transform: rotateZ(-150deg);
}

.disabled-arrow {
    opacity: 0.5;
    pointer-events: none;
}

.sp-complete {
    display: flex;
    justify-content: center;
    align-items: center;
}

.sp-complete svg {
    width: 80px;
    color: ${brandColor};
}

.sp-col-left.mouse-over, .sp-col-right.mouse-over {
    background-color: ${brandSubColor};
}

@media (max-width: 768px){
    .sp-col-left.mouse-over, .sp-col-right.mouse-over {
        background-color: unset;
    }

    .sp-row-left, .sp-row-right {
        font-size: 1.2rem;
    }
    
    .sp-container {
        max-width: 350px;
        margin: 0 auto;
    }
    .sp-arrow-left:hover {
        transform: translateX(0px);
    }

    .sp-arrow-right:hover {
        transform: translateX(0px);
    }

    .sp-col-center {
        justify-content: flex-start;
    }

    .sp-col-btn-text {
        display: flex;
        flex-direction: ${bothLegend ? 'column' : 'row'};
        gap: 5px;
        align-items: center;
        justify-content: ${bothLegend ? 'center' : 'flex-start'};
    }

    .sp-col-score {
        font-size: ${smallFont ? '0.8' : '1'}rem;
    }

    .sp-col-btn {
        padding: ${smallFont ? '0' : '10'}px;
        margin: ${smallFont ? '1' : '5'}px;
    }
}

/* hasError */
.hasError .sp-row-legend {
    transform: rotateX(0) !important;
    pointer-events: auto !important;
}

.hasError .sp-rating {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    pointer-events: auto;
}

.hasError .sp-card {
    position: unset;
    margin-top: 40px;
    border: 1px solid #737373;
    padding: 10px;
    border-radius: 10px;
}

.hasError .sp-card.error-focus {
    border-color: ${errorColor};
}

.hasError .sp-col-btn.error-focus {
    border-color: ${errorColor};
}

.hasError .sp-arrow-btn {
    display: none;
}

.hasError .sp-complete {
    display: none;
}

.sp-rate-group {
    width: 100%;
    padding: 5px;
}

.sp-group-text {
    width: 100%;
    background-color: #ccc;
    padding: 5px;
    text-align: center;
    border-radius: 5px;
    transition: transform 0.5s;
}

.speeding-handle {
    pointer-events: none;
    opacity: 0.7;
}

            `}</style>
            {!bothLegend ? (
                <div>
                    <style jsx="true">{`
@media (max-width: 768px){
    .sp-col-btn-box {
        flex-direction: column;
    }

    .sp-col-btn {
        flex-direction: row;
        justify-content: flex-start;
        text-align: left;
    }

    .arrow-container {
        display: ${bothLegend ? 'flex' : 'none'};
    }
}
                    `}</style>
                </div>
            ) : null}
            <div className={"sp-question animate__animated animate__fadeIn"}>
                <div className={"sp-arrow-btn sticky-class"}>
                    <div className={classHandler(ansIndex == 0, "sp-arrow-left", "disabled-arrow")} 
                        onClick={()=>{
                            pageOnClick(-1);
                            setAutoNext(false);
                            focusTop();
                        }
                        }>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={"sp-arrow-icon"}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                    <div className={classHandler(ansIndex == elRows.length, "sp-answer-count", "hide")}>
                        {ansIndex+1}/{elRows.length}
                    </div>
                    <div className={classHandler((ansIndex == (elRows.length)) || (elRows[ansIndex]['answer'] == 'null'), "sp-arrow-right", "disabled-arrow")} 
                        onClick={()=>{
                            pageOnClick(1);
                            setAutoNext(true);
                            focusTop();
                        }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={"sp-arrow-icon"}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>
                </div>
                <div className={"sp-container"} style={{maxHeight: (hasErrorFlag && ansIndex == elRows.length) ? '100px' : null}}>
                    <div className={"sp-card-container"}>
                        {elRows.map((row, rowIndex)=>{
                            return (
                                <div key={rowIndex} className={classHandler(errRows.includes(String(rowIndex)) || errRowLegends.includes(String(rowIndex)), "sp-card", "error-focus")} style={{transform: showError ? null : (isRTL ? `translateX(${offset*(-1)}%)` : `translateX(${offset}%)`)}}> 
                                    {Object.keys(groupInfo).length > 0 && showGroup ? (
                                        <div className={"sp-rate-group"}>
                                            <div className={`sp-group-text sp-group-${groupInfo[row.label].label}`}>
                                                {groupInfo[row.label].text}
                                            </div>
                                        </div>
                                    ) : null}
                                    <div className={haveRightLegend ? "sp-col-left-right" : "sp-row-legend"}>
                                        <div className={haveRightLegend ? "sp-row-card sp-row-left" : "sp-row"}>
                                            {qaShow ? (<p className="qaCode-label">[{row.label}]{haveRightLegend ? ("_left") : null}</p>) : null}
                                            <p dangerouslySetInnerHTML={{__html: row.text}}></p>
                                        </div>
                                        {haveRightLegend ? (
                                            <div className={"sp-row-card sp-row-right"}>
                                                {qaShow ? (<p className="qaCode-label">[{row.label}]_right</p>) : null}
                                                <p dangerouslySetInnerHTML={{__html: row.rightLegend}}></p>
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className={"sp-rating"}>
                                        {showArrow ? (
                                            <div className={"arrow-container"}>
                                                <div className={"arrow-left"}></div>
                                                <div className={"arrow-right"}></div>
                                            </div>
                                        ) : null}
                                        {bothLegend ? (
                                            <div className={"sp-col-legend-box"}>
                                                <div className={classHandler(leftFlag, "sp-col-legend sp-col-left", "mouse-over")} dangerouslySetInnerHTML={{__html: left}}></div>
                                                <div className={classHandler(rightFlag, "sp-col-legend sp-col-right", "mouse-over")} dangerouslySetInnerHTML={{__html: right}}></div>
                                            </div>
                                        ) : null}

                                        <div className={"sp-col-btn-box show"}>
                                        {cols.map((col, colIndex)=>{
                                            if( mode === "rating" ){
                                                return (
                                                    <ColButton
                                                        uid={uid}
                                                        key={colIndex}
                                                        row={row}
                                                        col={col}
                                                        autoNumber={autoNumber}
                                                        ansUpdate={()=>{answerUpdate(rowIndex, col.index)}}
                                                        mouseOverEvent={()=>{hoverEvent(col.index, true)}}
                                                        mouseOutEvent={()=>{hoverEvent(col.index, false)}}
                                                        qaShow={qaShow}
                                                        grouping={grouping}
                                                        errRow={errRows}
                                                        errCol={errCols}
                                                    />
                                                )
                                            }else{
                                                if( ["up", "down"].includes(mode) ){
                                                    if( rowIndex === 0 ){
                                                        return (
                                                            <ColButton
                                                                uid={uid}
                                                                key={colIndex}
                                                                row={row}
                                                                col={col}
                                                                autoNumber={autoNumber}
                                                                ansUpdate={()=>{answerUpdate(rowIndex, col.index)}}
                                                                mouseOverEvent={()=>{hoverEvent(col.index, true)}}
                                                                mouseOutEvent={()=>{hoverEvent(col.index, false)}}
                                                                qaShow={qaShow}
                                                                grouping={grouping}
                                                                errRow={errRows}
                                                                errCol={errCols}
                                                            />
                                                        );
                                                    }

                                                    const beforeRow = rowIndex - 1;
                                                    const beforeAnswer = elRows[beforeRow].answer;
                                                    if( beforeAnswer !== undefined && beforeAnswer !== null && beforeAnswer !== "null" ){
                                                        if( mode === "up" ? colIndex >= beforeAnswer : colIndex <= beforeAnswer ){
                                                            return (
                                                                <ColButton
                                                                    uid={uid}
                                                                    key={colIndex}
                                                                    row={row}
                                                                    col={col}
                                                                    autoNumber={autoNumber}
                                                                    ansUpdate={()=>{answerUpdate(rowIndex, col.index)}}
                                                                    mouseOverEvent={()=>{hoverEvent(col.index, true)}}
                                                                    mouseOutEvent={()=>{hoverEvent(col.index, false)}}
                                                                    qaShow={qaShow}
                                                                    grouping={grouping}
                                                                    errRow={errRows}
                                                                    errCol={errCols}
                                                                />
                                                            );
                                                        }
                                                    }
                                                }
                                            }
                                        })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {!showError ? (
                            <div className={"sp-card"} style={{transform: (isRTL ? `translateX(${offset*(-1)}%)` : `translateX(${offset}%)`)}}>
                                {ansIndex == elRows.length ? (
                                    <div className={"sp-complete animate__animated animate__bounceIn"}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </div>
                                ) : null}
                            </div>
                            ) : null}
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

const CustomRating = ({
    setRoot,
    json, 
    mode="rating",
    leftText, 
    rightText, 
    answers,
    hold=0.5,
    flexDirection="row",
    disableContinue=true,
    autoContinue=false,
    autoNumber=true,
    showArrow=false,
    showGroup=false,
    groupInfo={},
    loadingQuery='.custom-loader'})=>{
    //Model Check
    if( !["rating", "up", "down"].includes(mode) ){
        console.log("❌ The Mode argument can be entered as rating, up, low");
        return;
    }

    const root = document.querySelector(setRoot);
    const {cols, rows} = json;
    const filteredAnswers = Object.values(answers).filter(value => value !== 'null');

    const regex = /(\([^)]+\))\s*(.*)/;

    let numberFlag = autoNumber;
    /* Col numbering */
    if( autoNumber ){
        cols.forEach((col, index)=>{
            const colText = col.text;
            const colNumber = colText.match(regex);
            if( colNumber !== null ){
                const numberChk = colNumber[1];
                const mainText = colText.replace(numberChk, '').trim();
                col['text'] = mainText == '' ? null : mainText;
                col['scoreText'] = numberChk;
                json['cols'][index] = col;
            }else{
                col['scoreText'] = null;
                json['cols'][index] = col;
            }
            // if( colNumber === null ){
            //     numberFlag = false;
            //     return
            // }
        });
    }

    ReactDOM.render(
        <SetLeftRight
            json={json}
            left={leftText} 
            right={rightText}
            mode={mode}
            disableContinue={disableContinue}
            answers={answers}
            hold={hold}
            flexDirection={flexDirection}
            showArrow={showArrow}
            showGroup={showGroup}
            groupInfo={groupInfo}
            autoContinue={rows.length != filteredAnswers.length ? autoContinue : false}
            autoNumber={numberFlag}
        />, root
    );
    const loading = document.querySelector(loadingQuery);
    if( loading !== undefined && loading!== null){
        loading.remove();
    }
}
