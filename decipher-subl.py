import sublime, sublime_plugin,re
from itertools import product
import html

#define survey context
def returnContext(self):
    returnString = self.view.find('surveyType=(.*)',0)
    if returnString:
        returnString = self.view.substr(returnString)
        return returnString[11:14]
    else:
        return ' '
# returns array [input, label,title]
def tidyQuestionInput(input):
    input = input.strip()
    input = '\n'.join([i.strip() for i in input.split('\n')])
    input = re.sub(r"^(\w?\d+)\.(\d+)",r"\1_\2",input)

    # 2024-01-19 alt update
    # alt label check
    alt_check = re.match(r'\[(.*?)\]', input.split('\n')[0])
    alt = None
    if alt_check :
      alt = input.split('\n')[0]
      alt = alt[1:-1]
      alt = alt.replace('[', '(').replace(']', ')')
      alt = alt.strip()
      input = '\n'.join(input.split('\n')[1:])

    while "\n\n" in input:
        input = input.replace("\n\n", "\n")

    label = re.split(r"^([a-zA-Z0-9-_]+)+(\.|:|\)|\s)", input, 1)[1]
    input = re.split(r"^([a-zA-Z0-9-_]+)+(\.|:|\)|\s)", input, 1)[-1]

    if label[0].isdigit():
        label = "Q" + label
    if "@" in input:
        title = input[0:(input.index("@"))]
    else:
        input_array = []
        if "<row" in input:
            input_array.append(input.index("<row"))
        if "<col" in input:
            input_array.append(input.index("<col"))
        if "<choice" in input:
            input_array.append(input.index("<choice"))
        if "<comment" in input:
            input_array.append(input.index("<comment"))
        if "<group" in input:
            input_array.append(input.index("<group"))
        if "<net" in input:
            input_array.append(input.index("<net"))
        if "<exec" in input:
            input_array.append(input.index("<exec"))
        if "<insert" in input:
            input_array.append(input.index("<insert"))
        if len(input_array) == 0:
            title = input
        else:
          input_index = min(input_array)
          title = input[0:input_index]

    input = input.replace(title, "")
    input = input.replace('\n', '\n\t')
    return [input, label, title, alt]


# Setup QuestionClassNames Only Radio/Checkbox
def setQuestionClassNames(output) :
    # Custom Button Add
    class_name = 'ss:questionClassNames=\"%s\"'
    # sp-custom-btn btn-mw-500 btn-cols-1
    rows = [x for x in output.split('\n') if '<row' in x]
    row_cnt = len(rows)
    btn_class = ['sp-custom-btn']

    if not any(tag in output for tag in ['<insert', '<col', '<choice', '<group'])  : 
      pattern = r">([^<>]+)<"
      get_text = [re.findall(pattern, x)[0] for x in rows]
      if get_text :
        get_text = [x.strip().replace(' ', '') for x in get_text]
        text_count = [len(x) for x in get_text]
        max_count = max(text_count)
        min_count = min(text_count)

        if row_cnt//5 >= 2 :
          if not (min_count >= 15) :
            col_cnt = row_cnt//5
            btn_class.append('btn-cols-%s'%(col_cnt))
        else :
          # 300 = 17 이하
          # 500 = 30 이하
          # 700 = 40 이하      
          if max_count <= 15 :
            btn_class.append('btn-mw-300')
          elif max_count <= 30 :
            btn_class.append('btn-mw-500')
          elif max_count <= 40 :
            btn_class.append('btn-mw-700')

    class_name = class_name%(' '.join(btn_class))

    if any(tag in output for tag in ['<col', '<choice', '<group']) :
      class_name = None

    return class_name



def tidySurveyInput(input):
    input = re.sub("\t+", " ", input)
    input = re.sub("\n +\n", "\n\n", input)
    funkyChars = [(chr(133),'...'),(chr(145),"'"),(chr(146),"'"),(chr(147),'"'),(chr(148),'"'),(chr(151),'--')]
    for pair in funkyChars:
        input = input.replace(pair[0],pair[1])
    input = re.sub("\n{3,}", "\n\n", input)
    input = input.replace("&", "&amp;")
    input = input.replace("&amp;#", "&#")
    return input

# normal survey return array header & footer
def newSurvey():
    HEADER = """<?xml version="1.0" encoding="UTF-8"?>
<survey 
  alt=""
  autosave="0"
  builder:wizardCompleted="1"
  builderCompatible="1"
  compat="150"
  delphi="1"
  secure="1"
  fir="on"
  displayOnError="all"
  extraVariables="source,record,decLang,list,userAgent"
  html:showNumber="0"
  lang="korean"
  markerTimeout="0"
  mobile="compat"
  mobileDevices="smartphone,tablet,desktop"
  name="Survey"
  persistentExit="1"
  setup="term,decLang,quota,time"
  ss:disableBackButton="1"
  ss:enableNavigation="1"
  ss:hideProgressBar="0"
  ss:logoAlt="Nielsen Consumer LLC"
  ss:includeCSS="/survey/selfserve/nielseniq.css"
  ss:logoFile="selfserve/nielseniq.png"
  ss:logoPosition="left"
  theme="company/nielseniq-new"
  state="testing">

<res label="chk_plz">응답 확인 부탁드립니다.</res>
<res label="samegrid">모든 항목에 대해 동일한 답변을 입력했습니다.</res>
<res label="softerr">응답을 다시 한번 확인해 주세요. 응답이 맞을 경우, 다음버튼을 누르고 진행을 하시면 됩니다.</res>
<res label="err2010">하나 이상의 답변을 입력하십시오.</res>
<res label="err2011">동일한 답변을 입력하지 마십시오.</res>
<res label="err2012">첫 번째 텍스트 입력란부터 순서대로 입력하십시오.</res>
<res label="err2050">중복 입력하지 마십시오.</res>
<res label="badhan">ㄱ,ㄲ,ㄴ,ㄷ,ㄸ,ㄹ,ㅁ,ㅂ,ㅃ,ㅅ,ㅆ,ㅇ,ㅈ,ㅉ,ㅊ,ㅋ,ㅌ,ㅍ,ㅎ,ㅏ,ㅐ,ㅑ,ㅒ,ㅓ,ㅔ,ㅕ,ㅖ,ㅗ,ㅘ,ㅙ,ㅚ,ㅛ,ㅜ,ㅝ,ㅞ,ㅟ,ㅠ,ㅡ,ㅢ,ㅣ,ㄵ,ㄶ,ㄺ,ㄻ,ㄼ,ㄽ,ㄾ,ㄿ,ㅀ,ㅄ</res>
<res label="badhan_err">입력 확인 부탁 드립니다.</res>
<res label="badspa">@,$,%,#,*,!,?</res>
<res label="badspa_err">특수 문자는 입력하실 수 없습니다.</res>
<res label="block_ie">Internet Explorer는 지원하지 않습니다.</res>

<samplesources default="0">
  <samplesource list="0">
    <title>Open Survey</title>
    <completed>It seems you have already entered this survey.</completed>
    <exit cond="terminated"><strong>본 조사에 참여해주셔서 감사합니다.</strong><br /><br />본격적으로 조사를 시작하기 전에, 귀하가 본 조사에 적합한 응답 대상인지 알아보기 위해 몇 가지의 질문을 드렸습니다.<br /><br />죄송합니다. 귀하께서는 본 조사의 응답 대상이 아니십니다.<br /><br />차후에 다른 온라인 조사에 참여해주시면 감사하겠습니다.<br /><br />귀하의 소중한 의견은 더 나은 제품과 서비스를 개발하는데 좋은 정보가 될 것입니다.</exit>
    <exit cond="qualified"><strong>이로써 설문이 완료되었습니다. </strong><br /><br /><strong>귀한 시간 내주셔서 대단히 감사드립니다.</strong></exit>
    <exit cond="overquota"><strong>본 조사에 참여해 주셔서 감사합니다.</strong><br /><br />안타깝게도, 귀하께서 해당하시는 조사 대상 그룹의 조사는 이미 종료되었습니다.<br /><br />다음에 참여해 주시기 바랍니다.</exit>
  </samplesource>

  <samplesource list="1">
    <title>Tillion</title>
    <invalid>You are missing information in the URL. Please verify the URL with the original invite.</invalid>
    <completed>It seems you have already entered this survey.</completed>
    <var name="eid" unique="1"/>
    <var name="sid" required="1"/>
    <exit cond="terminated" url="http://out.pmirnc.com/?sid=${sid}&amp;eid=${eid}&amp;st=S&amp;stdt=SO1"/>
    <exit cond="overquota" url="http://out.pmirnc.com/?sid=${sid}&amp;eid=${eid}&amp;st=Q&amp;stdt=QO"/>
    <exit cond="qualified" url="http://out.pmirnc.com/?sid=${sid}&amp;eid=${eid}&amp;st=C&amp;stdt=CO1"/>
  </samplesource>

  <samplesource list="2">
    <title>Toluna</title>
    <invalid>You are missing information in the URL. Please verify the URL with the original invite.</invalid>
    <completed>It seems you have already entered this survey.</completed>
    <var name="GID" unique="1"/>
    <var name="sname" required="1"/>
    <exit cond="terminated" url="http://ups.surveyrouter.com/trafficui/mscui/SOTerminated.aspx?sname=${sname}&amp;TolunaEnc=${HQTolunaEnc.val}&amp;GID=${GID}"/>
    <exit cond="overquota" url="http://ups.surveyrouter.com/trafficui/mscui/SOQuotafull.aspx?sname=${sname}&amp;TolunaEnc=${HQTolunaEnc.val}&amp;GID=${GID}"/>
    <exit cond="qualified" url="http://ups.surveyrouter.com/trafficui/mscui/SOQualified.aspx?sname=${sname}&amp;TolunaEnc=${HQTolunaEnc.val}&amp;GID=${GID}"/>
  </samplesource>

  <samplesource list="9">
    <title>UserIdSampleSource</title>
    <invalid>You are missing information in the URL. Please verify the URL with the original invite.</invalid>
    <completed>It seems you have already entered this survey.</completed>
    <var name="UID" unique="1"/>
    <exit cond="terminated"><strong>본 조사에 참여해주셔서 감사합니다.</strong><br /><br />본격적으로 조사를 시작하기 전에, 귀하가 본 조사에 적합한 응답 대상인지 알아보기 위해 몇 가지의 질문을 드렸습니다.<br /><br />죄송합니다. 귀하께서는 본 조사의 응답 대상이 아니십니다.<br /><br />차후에 다른 온라인 조사에 참여해주시면 감사하겠습니다.<br /><br />귀하의 소중한 의견은 더 나은 제품과 서비스를 개발하는데 좋은 정보가 될 것입니다.</exit>
    <exit cond="qualified"><strong>이로써 설문이 완료되었습니다.</strong><br /><br /><strong>제출해 주셔서 감사합니다</strong></exit>
    <exit cond="overquota"><strong>본 조사에 참여해 주셔서 감사합니다. </strong><br /><br />안타깝게도, 귀하께서 해당하시는 조사 대상 그룹의 조사는 이미 종료되었습니다.<br /><br />다음에 참여해 주시기 바랍니다.</exit>
  </samplesource>

</samplesources>

<suspend/>

<style name="respview.client.css"><![CDATA[
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
<link rel="stylesheet" href="[rel util.css]"/>
<style>
.hangle-span{color:red;border:0;text-align:right;width:200px; }

\@media (prefers-color-scheme: dark) {
  .non-touch .fir-icon:hover .rounded .fir-base, .non-touch .fir-icon:hover .square .fir-base, .non-touch .grid-table-mode .clickableCell:hover .fir-icon .rounded .fir-base, .non-touch .grid-table-mode .clickableCell:hover .fir-icon .square .fir-base { fill: #878787; }
  .fir-icon.selected .rounded .fir-selected, .fir-icon.selected .square .fir-selected { fill: #878787; }
}

.sq-cardsort-bucket-count{display: none !important;}

.sq-cardrating-widget{
  width: 924px !important; 
}

.sq-cardrating-content{
  font-size: 1.2rem !important;
}
\@media all and (min-width: 750px){
 .sq-cardrating-content{
  font-size: 1.4rem !important;
 }
}

.sq-sliderpoints-container{
  max-width: 900px;
}

.sq-sliderpoints-container{
  margin-left: 0 !important;
}

.sq-cardrating-button{
  max-width: 85px !important;
}

.dq-imgupload{
  max-width: 924px;
}

.sq-accordion-row{
  max-width: 924px !important;
  font-size: 1.2rem;
}
</style>
]]></style>
<style name="respview.client.js"><![CDATA[
<script src="[rel checkIE.js]"></script>
<script src="[rel util.js]"></script>
<script>
window.addEventListener("DOMContentLoaded", function(){
  blockIE();
  gridRankSetting("gridRank", "exclusive");
  
  const restart = document.querySelector(".autosave-restart");
  if( restart ){ restart.remove(); }
})
</script>
]]></style>
<suspend/>

<style label="hideElements" name="question.element"><![CDATA[
\@if ec.simpleList
<div class="element $(rowStyle) $(levels) $(extraClasses) ${col.group.styles.ss.groupClassNames if col.group else (row.group.styles.ss.groupClassNames if row.group else "")} $(col.styles.ss.colClassNames) $(row.styles.ss.rowClassNames) ${"clickableCell" if isClickable else ""}"$(extra)>
    ${v2_insertStyle('el.label.start')}
    ${v2_insertStyle('el.label.end')}
</div>
\@else
<$(tag) $(headers) class="cell nonempty element $(levels) ${"desktop" if this.grouping.cols else "mobile"} border-collapse $(extraClasses) ${col.group.styles.ss.groupClassNames if col.group else (row.group.styles.ss.groupClassNames if row.group else "")} $(col.styles.ss.colClassNames) $(row.styles.ss.rowClassNames) ${"clickableCell" if isClickable else ""}"$(extra)>
    ${v2_insertStyle('el.label.start')}
    ${v2_insertStyle('el.label.end')}
</$(tag)>
\@endif
]]></style>

<suspend/>

<style cond="1" name="survey.respview.footer.support"><![CDATA[
Copyright &#9400; ${time.strftime('%Y')} Nielsen Consumer LLC. All Rights Reserved. <a href="@(PrivacyPolicyUrl)" target="_blank" rel="noopener">@(PrivacyPolicy)</a>.
<div class="block-ie hidden">
  <div>${res.block_ie}</div>
  <div><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:100px;">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg></div>
</div>
]]></style>

<suspend/>

<exec when="init">
survey_path = gv.survey.path.split("/")[-2] if gv.survey.path.split("/")[-1] == "temp-edit-live" else gv.survey.path.split("/")[-1]
# Adhoc = AD / Tracking = TRC
imgdr = "https://nielsenkor.cafe24.com/Decipher/AD/{}/".format(survey_path)

from datetime import datetime
import random

def status(condt,label):
    if condt : 
      RespStatus.val=getattr(RespStatus,"{}".format(label)).index

def soft_Err(cond, str):
  if cond :
    if p.chk==0 :
      p.chk=1
    else :
      p.chk=0
      error(str)
  else :
    p.chk=1

def samegrid():
  qid = allQuestions[this.label]
  checkAnswer = [i.label for i in qid.rows if not i.val == None]
  if len(checkAnswer) gt 1 :
    if len(set(qid.val)-set([None])) == 1:
      soft_Err(True, "%s<br/>%s"%(res.samegrid, res.softerr))
    else :
      p.chk=1
  else :
    p.chk=1

def rankCnt(multiBase,maxRank):
  cnt = maxRank
  if not multiBase.count ge maxRank :
    cnt = multiBase.count
  return cnt


# dupchk open list
def checkOpen():
  str_1=res.err2010
  str_2=res.err2011
  str_3=res.err2012

  set_list=[]
  
  vals=[i.val for i in this.rows if not i.val == None]
  for s in vals:
    if s != "" :
      flag=True
      set_list.append(s.upper())


  if not set_list :
    error(str_1)
  else :
    for j in range(0,len(set_list)-1):
        preval=this.rows[j].val
        st=j+1
        for i in range(st,len(set_list)):
            postval=this.rows[i].val
            if preval != "" and postval != "" :
              if preval==postval:
                  error(str_2)

    for k in range(0,len(set_list)):
      if this.rows[k].val=="":
        error(str_3)


# TMO Error
def checkDuplicates(Qid) :
  # before Q
  Arr=[]
  
  # Curret Q
  Brr=[]
  
  # Label Array
  Crr=[]
  
  vls=allQuestions[Qid].values

  for i in vls:
    Arr.append(i.upper())
    Crr.append(i)

  for j in this.values:
    Brr.append(j.upper())


  if len(Arr) gt 0 and len(Brr) gt 0:
    if (Brr[0]!=""):
      for i in range(0,len(Brr)):
        preText=Brr[i]
        for j in range(0,len(Arr)):
          currentText=Arr[j]
          if preText!="" and currentText!="":
            if preText==currentText:
              errstr=Crr[j]+'-'+res.err2050
              error(errstr)
              break


def badtext() :
  tt=[i.replace(" ","") for i in this.values if not i==None]
  badhan=(res.badhan)
  badhan=badhan.split(',')

  badspa=(res.badspa)
  badspa=badspa.split(',')


  for i in range(0,len(tt)) :
    current_v=tt[i]
    current_len=len(current_v)
    for j in range(0,int(current_len),3) :
      fn=j
      ln=int(j)+3
      if current_v[fn:ln] in badhan :
        error(res.badhan_err)


  for i in range(0,len(tt)) :
    current_v=tt[i]
    current_len=len(current_v)
    for j in range(0,int(current_len),1) :
      if current_v[j] in badspa :
        error(res.badspa_err)

def group_rows(question, grouped_rows ):
    first_item_index = None

    shuffle_order = [row.index for row in question.rows.order]

    for index, row in enumerate( shuffle_order ):
        if question.rows[row].label in grouped_rows:
            if first_item_index == None:
                first_item_index = index
            else:
                # As we continue iterating through the shuffle order
                # each time we reach a row that is in the set of
                # rows to be grouped together, increment our index
                # value and move this row into the new position
                first_item_index += 1
                shuffle_order.insert( first_item_index, shuffle_order.pop(index) )

    question.rows.order = shuffle_order
</exec>

<suspend/>

<exec>
p.chk = 1
</exec>


<suspend/>

<exec sst="0">
if list=="2":

 TolunaEncKey = (int(int(GID) + 3) % 4001) * 17
 HQTolunaEnc.val = TolunaEncKey
 #setExtra("TolunaEnc",str(TolunaEncKey))
</exec>

<suspend/>

<text 
  label="HQTolunaEnc"
  randomize="0"
  size="25"
  translateable="0"
  where="execute,survey,report">
  <title>TolunaEnc</title>

</text>

<suspend/>

<quota label="tot" overquota="noqual" sheet="tot"/>

<suspend/>

<radio 
  label="RespStatus"
  where="execute,survey,report">
  <title>STATUS</title>
  <exec>
#incomplete
status(True,'r2')
  </exec>

  <row label="r1" value="1">complete</row>
  <row label="r2" value="2">incomplete</row>
  <row label="AgreeC" value="3">Agree-Close</row>
  <row label="Scr_Video" value="4">Scr_Video</row>
  <row label="Scr_Audio" value="5">Scr_Audio</row>
  <row label="r96" value="96">Removed - Over Quota/ Sample</row>
  <row label="r97" value="97">Removed - QC</row>
  <row label="r98" value="98">Unsubscribed</row>
  <row label="r99" value="99">Failed Data Trapping Test</row>
</radio>

<suspend/>

<radio 
  label="Agree"
  randomize="0">
  <title>
<strong>정보 기밀 유지에 관한 동의</strong><br/><br/>

<strong>정보 기밀 유지</strong><br/>
응답자는 법규에 의거한 경우를 제외하고는 모든 온라인 조사와 관련된 정보 및 내용을 기밀로 유지하며, 제 삼자와 공유하지 않습니다.<br/><br/>

<strong>지적 재산 및 저작권에 관한 공지</strong><br/>
Copyright © ${time.strftime('%Y')} NielsenIQ. All rights reserved. 본 조사의 저작권 및 제공자료는 NielsenIQ에 소유되어 있습니다. NielsenIQ의 동의 없이 본 조사에 관한 어떠한 내용도 사용, 노출, 재생, 복사, 배포, 수정, 제공, 재발행 또는 정정할 수 없습니다. 본 조사에 대한 접근을 통하여 귀하 또는 제 삼자에게 어떠한 지적 재산권도 양도되지 않습니다. 본 조사에 대한 모든 권한과, 법적 권리 및 이권은 NielsenIQ의 독자적인 재산입니다.<br/><br/>

<div style="border-style: solid; border-width: 1px; padding: 1px 4px 1px 4px;"><i>아래를 클릭하여, 앞서 진술된 모든 약관에 동의하고, <b>또</b> 귀하께서 <b>18</b> 세 이상 <font style="color: red;">또는 부모나 보호자의 동의 하에 본 조사에 참여하신 18세 미만이라는 점 및 정보 기밀 유지에 동의 여부 표시를 해주시기 바랍니다. </font></i></div>
</title>
  <row label="r1" value="1">예, 동의합니다</row>
  <row label="r2" value="2">아니요, 동의하지 않습니다</row>
</radio>

<suspend/>

<exec>
status(Agree.r2,'AgreeC')
</exec>

<term label="Agreeclose" cond="Agree.r2">Agree Close</term>

<suspend/>

<textarea 
  label="Feedback"
  randomize="0"
  optional="1">
  <title>질문은 이것으로 마칩니다. 저희 온라인 설문에 대한 귀하의 제안이나 의견이 있으시면 말씀해 주시면 감사하겠습니다. 향후 저희 설문 조사에 도움이 될만한 것이면 어떤 것이라도 좋습니다.</title>
</textarea>

<suspend/>"""
    FOOTER = """<exec>
status(True,'r1')
</exec>
</survey>"""

    return[HEADER,FOOTER]


def newSurveyMCP():
    HEADER = """<?xml version="1.0" encoding="UTF-8"?>
<survey 
  alt=""
  autosave="0"
  builder:wizardCompleted="1"
  builderCompatible="1"
  compat="147"
  delphi="1"
  displayOnError="all"
  extraVariables="source,record,decLang,list,userAgent"
  fir="on"
  html:showNumber="0"
  markerTimeout="0"
  mobile="compat"
  mobileDevices="smartphone,tablet,desktop"
  name="Survey"
  persistentExit="1"
  secure="1"
  setup="term,decLang,quota,time"
  ss:disableBackButton="1"
  ss:enableNavigation="1"
  ss:hideProgressBar="0"
  ss:includeCSS="survey/selfserve/nielseniq.css"
  ss:logoAlt="Nielsen Consumer LLC"
  ss:logoFile="selfserve/nielseniq.png"
  ss:logoPosition="left"
  state="testing"
  theme="company/nielseniq-new">

<res label="chk_plz">Please check the response again.</res>
<res label="samegrid">entered the same answer.</res>
<res label="softerr"><br />Please check the response again. If the answer is correct, click the Next button and proceed.</res>
<res label="err2010">Please enter at least one answer</res>
<res label="err2011">Please don't enter the same answer</res>
<res label="err2012">Please enter answers from first text box consecutively.</res>
<res label="err2050">Please do not enter duplicate(s).</res>
<res label="doNotIE">Do not use internet explorer</res>
<samplesources default="0">
  <samplesource list="0">
    <title>Open Survey</title>
    <invalid>You are missing information in the URL. Please verify the URL with the original invite.</invalid>
    <completed>It seems you have already entered this survey.</completed>
    <var name="CO" required="1" values="1,2,3"/>
    <exit cond="terminated">Thank you for taking our survey.</exit>
    <exit cond="qualified">Thank you for taking our survey. Your efforts are greatly appreciated!</exit>
    <exit cond="overquota">Thank you for taking our survey.</exit>
  </samplesource>

  <samplesource list="2">
    <title>Toluna</title>
    <invalid>You are missing information in the URL. Please verify the URL with the original invite.</invalid>
    <completed>It seems you have already entered this survey.</completed>
    <var name="CO" required="1" values="1,2,3"/>
    <var name="GID" unique="1"/>
    <var name="sname" required="1"/>
    <exit cond="terminated" url="http://ups.surveyrouter.com/trafficui/mscui/SOTerminated.aspx?sname=${sname}&amp;TolunaEnc=${HQTolunaEnc.val}&amp;GID=${GID}"/>
    <exit cond="overquota" url="http://ups.surveyrouter.com/trafficui/mscui/SOQuotafull.aspx?sname=${sname}&amp;TolunaEnc=${HQTolunaEnc.val}&amp;GID=${GID}"/>
    <exit cond="qualified" url="http://ups.surveyrouter.com/trafficui/mscui/SOQualified.aspx?sname=${sname}&amp;TolunaEnc=${HQTolunaEnc.val}&amp;GID=${GID}"/>
  </samplesource>
</samplesources>

<suspend/>

<style name="respview.client.css"><![CDATA[
<style>
.blackdiv{ width: 90%; text-align: center; height: 100%; line-height: 32px; font-size: 20px; color: #fff!important; background-color: black!important; border-radius: 32px; margin:0 auto;height:100%;padding:5px;}
.bluediv{ width: 90%; text-align: center; height: 100%; line-height: 32px; font-size: 20px; color: #fff!important; background-color: #2196F3!important; border-radius: 32px; margin:0 auto;height:100%;padding:5px;}
.greendiv{ width: 90%; text-align: center; height: 100%; line-height: 32px; font-size: 20px; color: #fff!important; background-color: #86E57F!important; border-radius: 32px; margin:0 auto;height:100%;padding:5px;}
.bu{ font-weight:bold; text-decoration: underline;}
.boldblue{ font-weight:bold; color:blue; }
.boldgreen{ font-weight:bold; color:green; }
.boldred{ font-weight:bold; color:red; }
.boldcol{ font-weight:bold; color: #00ACEF;}
.autosave-restart{ display:none !important; }
.hidden{display: none !important;}
.hangle{color:red;border:0;text-align:right;width:200px; }
.question-text{ word-break: keep-all;}
.sq-cardsort-bucket-count{display: none !important;}


</style>
]]></style>
<style name="respview.client.js"><![CDATA[
<script>
$ (document).ready(function(){

  //browswer check
  var agent = navigator.userAgent.toLowerCase();
  if( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
    $ ("#browswerchk").show();
    $ ("#btn_continue").hide();
  }else{
    $ ("#browswerchk").hide();
    $ ("#btn_continue").show();
  }

  $ (".autosave-restart").hide();

  $ (document).change(function(){
    for(var i=1; i<=10; i++){
      var base = '.rank'+i+'.exclusive';
      var auto_cnt = i+1;
      var auto = '.rank'+auto_cnt+'.exclusive';
      if( $ (base).find('input[type=radio]').is(':checked') ){
        $ (auto).find('input[type=radio]').prop('checked',true);
        $ ('.rank'+i).find('.fir-icon.selected').attr('class','fir-icon');
        $ (base).find('.fir-icon').attr('class','fir-icon selected');
      }
    }
  });
});

function base_item(n){
  var base = $ ('.bases.r'+n+'br').find('select');
  var item = $ ('.items.r'+n+'br').find('select');
  
  if(!item.find('option').hasClass("base0")){
    var mClone = item.clone();
    var DrOpt1 = base.val();
    var baseClass = base.find("option:selected").attr('class');

    if( DrOpt1 == -1 ){
      item.find("option").remove();
      item.append(mClone.find("option[value=-1]").clone());
    }else{
      selectval = item.val();
      item.find("option").remove();
      item.append(mClone.find("option[value=-1]").clone());
      item.append(mClone.find("option[class="+baseClass+"]").clone());
      item.val(selectval);
    }
    item.find("option[value=-1]").addClass("base0");

   base.change(function(){
      DrOpt1 = base.val();
      baseClass = base.find("option:selected").attr('class');

      if( DrOpt1 == -1 ){
        item.find("option").remove();
        item.append(mClone.find("option[value=-1]").clone());
      }else{
        item.find("option").remove();
        item.append(mClone.find("option[value=-1]").clone());
        item.append(mClone.find("option[class="+baseClass+"]").clone());
      }
    });
  }
}
</script>
]]></style>
<suspend/>

<style label="hideElements" name="question.element"><![CDATA[
\@if ec.simpleList
<div class="element $(rowStyle) $(levels) $(extraClasses) ${col.group.styles.ss.groupClassNames if col.group else (row.group.styles.ss.groupClassNames if row.group else "")} $(col.styles.ss.colClassNames) $(row.styles.ss.rowClassNames) ${"clickableCell" if isClickable else ""}"$(extra)>
    ${v2_insertStyle('el.label.start')}
    ${v2_insertStyle('el.label.end')}
</div>
\@else
<$(tag) $(headers) class="cell nonempty element $(levels) ${"desktop" if this.grouping.cols else "mobile"} border-collapse $(extraClasses) ${col.group.styles.ss.groupClassNames if col.group else (row.group.styles.ss.groupClassNames if row.group else "")} $(col.styles.ss.colClassNames) $(row.styles.ss.rowClassNames) ${"clickableCell" if isClickable else ""}"$(extra)>
    ${v2_insertStyle('el.label.start')}
    ${v2_insertStyle('el.label.end')}
</$(tag)>
\@endif
]]></style>
<suspend/>

<exec when="init">
imgdr = "https://nielsenkor.cafe24.com/OURWEB/KOREA/"

def status(condt,label):
    if condt : 
      RespStatus.val=getattr(RespStatus,"{}".format(label)).index

def rk(none_arr):
  none=none_arr
  for i in this.rows :
    flag=True
    for j in none :
      if i.label==j :
        flag=False
    if flag :
      if i.count &gt;= 2 :
        return error(this.lget('duplicate-row'))

def dat(filename,baseid,basecode) :
  datfile=File(filename,baseid)
  if datfile:
    data_dict=datfile.get(basecode)
    return data_dict

def datToDict(filename,baseid,basecode) :
  dat_dict={}
  dats = dat(filename,baseid,basecode)
  if dats:
    for n,v in dat(filename,baseid,basecode).items() :
      dat_dict[n]=v
    return dat_dict

def soft_Err(str):
  if p.chk==0 :
    p.chk=1
  else :
    p.chk=0
    error(str)

def samegrid():
  qid = allQuestions[this.label]
  checkAnswer = [i.label for i in qid.rows if not i.val == None]
  if len(checkAnswer) gt 1 :
    if len(set(qid.val)-set([None])) == 1:
      soft_Err(res.samegrid+res.softerr)
    else :
      p.chk=1

def rankCnt(multiBase,maxRank):
  cnt = maxRank
  if not multiBase.count ge maxRank :
    cnt = multiBase.count
  return cnt


# dupchk open list
def checkOpen():
  str_1=res.err2010
  str_2=res.err2011
  str_3=res.err2012

  set_list=[]
  
  vals=[i.val for i in this.rows if not i.val == None]
  for s in vals:
    if s != "" :
      flag=True
      set_list.append(s.upper())


  if not set_list :
    error(str_1)
  else :
    for j in range(0,len(set_list)-1):
        preval=this.rows[j].val
        st=j+1
        for i in range(st,len(set_list)):
            postval=this.rows[i].val
            if preval != "" and postval != "" :
              if preval==postval:
                  error(str_2)

    for k in range(0,len(set_list)):
      if this.rows[k].val=="":
        error(str_3)



# TMO Error
def checkDuplicates(Qid) :
  # before Q
  Arr=[]
  
  # Curret Q
  Brr=[]
  
  # Label Array
  Crr=[]
  
  vls=allQuestions[Qid].values

  for i in vls:
    Arr.append(i.upper())
    Crr.append(i)

  for j in this.values:
    Brr.append(j.upper())


  if len(Arr) gt 0 and len(Brr) gt 0:
    if (Brr[0]!=""):
      for i in range(0,len(Brr)):
        preText=Brr[i]
        for j in range(0,len(Arr)):
          currentText=Arr[j]
          if preText!="" and currentText!="":
            if preText==currentText:
              errstr=Crr[j]+'-'+res.err2050
              error(errstr)
              break


def badtext() :
  tt=[i.replace(" ","") for i in this.values if not i==None]
  badhan=(res.badhan)
  badhan=badhan.split(',')

  badspa=(res.badspa)
  badspa=badspa.split(',')


  for i in range(0,len(tt)) :
    current_v=tt[i]
    current_len=len(current_v)
    for j in range(0,int(current_len),3) :
      fn=j
      ln=int(j)+3
      if current_v[fn:ln] in badhan :
        error(res.badhan_err)


  for i in range(0,len(tt)) :
    current_v=tt[i]
    current_len=len(current_v)
    for j in range(0,int(current_len),1) :
      if current_v[j] in badspa :
        error(res.badspa_err)
</exec>

<suspend/>

<exec>
p.chk = 1
</exec>

<suspend/>

<style cond="1" name="survey.respview.footer.support"><![CDATA[
Copyright &#9400; ${time.strftime('%Y')} Nielsen Consumer LLC. All Rights Reserved. <a href="@(PrivacyPolicyUrl)" target="_blank" rel="noopener">@(PrivacyPolicy)</a>.
]]></style>
<style name="survey.completion"><![CDATA[
\@if not gv.survey.root.styles.ss.hideProgressBar
    <div class="progress-bar progress-${"top" if gv.survey.root.progressOnTop else "bottom"}" title="@(progress-bar) - $(percent)% @(complete)">
      <div class="progress-box-outer"><span class="progress-box-completed" style="width: $(percent)%;"></span></div>
      <div class="progress-text"><span class="screen-readers-only">@(progress-bar) </span>$(percent)%</div>
    </div>
    <div id="browswerchk" style="display:none;color:red;"><span>${res.doNotIE}</span></div>
\@endif
]]></style>
<exec>
allL = ["english", "german", "simplifiedchinese"]

p.Ldict={
  1:["english"],
  2:["german"],
  3:["simplifiedchinese"]
}
</exec>

<suspend/>

<radio 
  label="HQ1">
  <title>(HIDDEN) Country</title>
  <exec>
country_label = "r{}".format(CO)
if hasattr(HQ1, country_label) :
    HQ1.val = HQ1.attr(country_label).index
  </exec>

  <row label="r1" value="1">US</row>
  <row label="r2" value="2">China</row>
  <row label="r3" value="3">Germany</row>
</radio>

<suspend/>

<note>LIVE : rowCond="row.label in p.Ldict[HQ1.selected.value]"</note>
<radio 
  label="LQ"
  grouping="cols"
  uses="languageselector.1"
  where="survey,notdp">
  <title>Please select the language you would like to take this survey in.</title>
  <comment>Please select a language</comment>
</radio>

<suspend/>

<exec>
p.langcode={
  "german":"de",
  "english":"en",
  "simplifiedchinese":"zh"
}
</exec>

<radio 
  label="RespStatus"
  where="execute,survey,report">
  <title>STATUS</title>
  <exec>
#incomplete
status(True,'r2')
  </exec>

  <row label="r1" value="1">complete</row>
  <row label="r2" value="2">incomplete</row>
  <row label="AgreeC" value="3">Agree-Close</row>
  <row label="Scr_Video" value="4">Scr_Video</row>
  <row label="Scr_Audio" value="5">Scr_Audio</row>
  <row label="r96" value="96">Removed - Over Quota/ Sample</row>
  <row label="r97" value="97">Removed - QC</row>
  <row label="r98" value="98">Unsubscribed</row>
  <row label="r99" value="99">Failed Data Trapping Test</row>
</radio>

<suspend/>

<radio 
  label="Agree"
  randomize="0"
  sst="0">
  <title>
Participation in this survey is voluntary.Your responses will be used to perform our research and prepare reports and analyses for our clients. We will keep your information confidential and will only share it with trusted third parties who are required to keep this information confidential. Neither your name nor any other identifying information will be used in any reports or analyses that we prepare for our clients.<br /><br />

For more information about how Nielsen uses and protects your information in connection with this survey, please visit:<br />
<a href="https://nielsenwebsurveys.com/ourweb/privacy/${p.langcode[LQ.selected.label]}/privacy.asp" target="_blank">https://nielsenwebsurveys.com/ourweb/privacy/${p.langcode[LQ.selected.label]}/privacy.asp</a><br /><br />

Are you aware of the privacy policy and do you AGREE that we can proceed with the interview?<br /><br />

To begin, click on the button below. As you move through the survey, please use the buttons at the bottom of each screen. Do not use your browser buttons.<br />
If you would like to pause the survey to return to it later, simply close the browser window and click on your original link to return.
</title>
  <row label="r1" value="1">Agree</row>
  <row label="r2" value="2">Disagree</row>
</radio>

<suspend/>

<exec>
status(Agree.r2,'AgreeC')
</exec>

<term label="Agreeclose" cond="Agree.r2">Agree Close</term>

<suspend/>



<suspend/>"""
    FOOTER = """<exec>
status(True,'r1')
</exec>
</survey>"""

    return[HEADER,FOOTER]

def newSurveyCMB():
    HEADER = """
            <survey
             name="Survey"
             alt=""
             autosave="1"
             extraVariables="source,list,url,record,ipAddress,userAgent,decLang"
             compat="138"
             builderCompatible="1"
             secure="0"
             setup="time,term,quota,decLang"
             ss:disableBackButton="1"
             trackCheckbox="1"
             mobile="compat"
             mobileDevices="smartphone,tablet,featurephone,desktop"
             state="testing"
             unique="">

            <!-- IMPORTANT: Remember to copy the nstyles file from v2/cmb/temp-cmb to the current project directory -->

            <samplesources default="0">
              <samplesource list="0" title="default">
                <exit cond="qualified"><b>Thanks again for completing the survey!<br/><br/>Your feedback and quick response to this survey are greatly appreciated.</b></exit>
                <exit cond="terminated"><b>Thank you for your input!</b></exit>
                <exit cond="overquota"><b>Thank you for your input!</b></exit>
              </samplesource>
            </samplesources>"""
    FOOTER = """</survey>"""
    return[HEADER,FOOTER]

def newSurveyEBAY():
    HEADER = """<survey
             name="eBay Survey"
             alt=""
             autosave="1"
             extraVariables="source,list,url,record,ipAddress,userAgent,co,decLang"
             compat="138"
             builderCompatible="1"
             secure="0"
             state="testing"
             setup="time,term,quota,decLang"
             ss:disableBackButton="1"
             displayOnError="all"
             unique=""
             mobile="compat"
             mobileDevices="smartphone,tablet,featurephone,desktop"
             lang="english"
             otherLanguages="danish,german,finnish,french,norwegian,spanish,swedish,uk">

            <res label="privacyText">Privacy Policy</res>
            <res label="helpText">Help</res>

            <!-- Remove or add countries as needed -->
            <languages default="english">
              <language name="danish" var="co" value="dk"/>
              <language name="german" var="co" value="de"/>
              <language name="finnish" var="co" value="fi"/>
              <language name="french" var="co" value="fr"/>
              <language name="norwegian" var="co" value="no"/>
              <language name="spanish" var="co" value="es"/>
              <language name="swedish" var="co" value="se"/>
              <language name="uk" var="co" value="uk"/>
              <language name="english" var="co" value="us"/>
            </languages>

            <!-- Remove or add countries as needed -->
            <radio label="vco" title="Country" virtual="bucketize(co)">
              <row label="dk">Denmark</row>
              <row label="de">Germany</row>
              <row label="fi">Finland</row>
              <row label="fr">France</row>
              <row label="no">Norway</row>
              <row label="es">Spain</row>
              <row label="se">Sweden</row>
              <row label="uk">United Kingdom</row>
              <row label="us">United Sates</row>
            </radio>

            <!-- Remove or add countries as needed -->
            <samplesources default="1">
              <samplesource list="1" title="eBay Sample">
             <!--  <var name="source" filename="invited.txt" unique="1"/>  un-comment this before launching -->
               <var name="co" required="1" values="dk,de,fi,fr,no,es,se,uk,us"/>
                <exit cond="qualified and co=='dk'" timeout="8" url="http://www.ebay.dk">Survey Completed - Thank you for your time and opinions!</exit>
                <exit cond="terminated and co=='dk'" timeout="8" url="http://www.ebay.dk">Thank you for your input!</exit>
                <exit cond="overquota and co=='dk'" timeout="8" url="http://www.ebay.dk">Thank you for your input!</exit>

                <exit cond="qualified and co=='de'" timeout="8" url="http://www.ebay.de">Survey Completed - Thank you for your time and opinions!</exit>
                <exit cond="terminated and co=='de'" timeout="8" url="http://www.ebay.de">Thank you for your input!</exit>
                <exit cond="overquota and co=='de'" timeout="8" url="http://www.ebay.de">Thank you for your input!</exit>

                <exit cond="qualified and co=='fi'" timeout="8" url="http://www.ebay.fi">Survey Completed - Thank you for your time and opinions!</exit>
                <exit cond="terminated and co=='fi'" timeout="8" url="http://www.ebay.fi">Thank you for your input!</exit>
                <exit cond="overquota and co=='fi'" timeout="8" url="http://www.ebay.fi">Thank you for your input!</exit>

                <exit cond="qualified and co=='fr'" timeout="8" url="http://www.ebay.fr">Survey Completed - Thank you for your time and opinions!</exit>
                <exit cond="terminated and co=='fr'" timeout="8" url="http://www.ebay.fr">Thank you for your input!</exit>
                <exit cond="overquota and co=='fr'" timeout="8" url="http://www.ebay.fr">Thank you for your input!</exit>

                <exit cond="qualified and co=='no'" timeout="8" url="http://www.ebay.no">Survey Completed - Thank you for your time and opinions!</exit>
                <exit cond="terminated and co=='no'" timeout="8" url="http://www.ebay.no">Thank you for your input!</exit>
                <exit cond="overquota and co=='no'" timeout="8" url="http://www.ebay.no">Thank you for your input!</exit>

                <exit cond="qualified and co=='es'" timeout="8" url="http://www.ebay.es">Survey Completed - Thank you for your time and opinions!</exit>
                <exit cond="terminated and co=='es'" timeout="8" url="http://www.ebay.es">Thank you for your input!</exit>
                <exit cond="overquota and co=='es'" timeout="8" url="http://www.ebay.es">Thank you for your input!</exit>

                <exit cond="qualified and co=='se'" timeout="8" url="http://www.ebay.se">Survey Completed - Thank you for your time and opinions!</exit>
                <exit cond="terminated and co=='se'" timeout="8" url="http://www.ebay.se">Thank you for your input!</exit>
                <exit cond="overquota and co=='se'" timeout="8" url="http://www.ebay.se">Thank you for your input!</exit>

                <exit cond="qualified and co=='uk'" timeout="8" url="http://www.ebay.co.uk">Survey Completed - Thank you for your time and opinions!</exit>
                <exit cond="terminated and co=='uk'" timeout="8" url="http://www.ebay.co.uk">Thank you for your input!</exit>
                <exit cond="overquota and co=='uk'" timeout="8" url="http://www.ebay.co.uk">Thank you for your input!</exit>

                <exit cond="qualified and co=='us'" timeout="8" url="http://www.ebay.com">Survey Completed - Thank you for your time and opinions!</exit>
                <exit cond="terminated and co=='us'" timeout="8" url="http://www.ebay.com">Thank you for your input!</exit>
                <exit cond="overquota and co=='us'" timeout="8" url="http://www.ebay.com">Thank you for your input!</exit>
              </samplesource>
            </samplesources>


            <html label="StandardIntro" where="survey">Thank you for taking the time to complete this survey. Your opinions are extremely valuable, and will help us to improve your eBay experience. Your responses are completely confidential and will only be used for research purposes. Your responses will be analyzed only in combination with those of other participants. See our <a href="http://pages.ebay.com/help/policies/privacy-policy.html" target="_blank">privacy policy</a>.</html>
            <suspend/>

            """


    FOOTER = """</survey>"""
    return[HEADER,FOOTER]

def newSurveyFMA():
    HEADER = """<survey
             name="Survey"
             alt=""
             autosave="0"
             extraVariables="source,list,url,record,ipAddress,userAgent,decLang"
             compat="124"
             builderCompatible="1"
             secure="0"
             state="testing"
             setup="time,term,quota,decLang"
             ss:disableBackButton="1"
             fwoe="text"
             mobile="compat"
             mobileDevices="smartphone,tablet,featurephone,desktop"
             ss:logoFile="fma/surveysonline_logo.gif"
             ss:logoPosition="left">

            <samplesources default="0">
              <samplesource list="0" title="default">
                <exit cond="qualified"><b>Thanks again for completing the survey!<br/><br/>Your feedback and quick response to this survey are greatly appreciated.</b></exit>
                <exit cond="terminated"><b>Thank you for your input!</b></exit>
                <exit cond="overquota"><b>Thank you for your input!</b></exit>
              </samplesource>
            </samplesources>"""

    FOOTER = """

                <radio label="vStatus" title="Status">
                <virtual>
                if 'recovered' in markers:
                    data[0][0] = 3
                else:
                    if 'qualified' in markers:
                        data[0][0] = 2
                    elif 'OQ' in markers:
                        data[0][0] = 1
                    else:
                        data[0][0] = 0
                </virtual>
                  <row label="r1">Term</row>
                  <row label="r2">OQ</row>
                  <row label="r3">Quals</row>
                  <row label="r4">Partials</row>
                </radio>

                </survey>"""
    return[HEADER,FOOTER]

def newSurveyGDI():
    HEADER = """<survey
                 name="Survey"
                 alt=""
                 autosave="0"
                 extraVariables="source,list,url,record,ipAddress,userAgent,decLang"
                 compat="138"
                 builderCompatible="1"
                 secure="0"
                 state="testing"
                 setup="time,term,quota,decLang"
                 ss:disableBackButton="1"
                 fixedWidth="tight"
                 mobile="compat"
                 mobileDevices="smartphone,tablet,featurephone,desktop"
                 zeroPad="1">

                <samplesources default="1">
                  <samplesource list="1" title="Greenfield/Toluna">
                    <var name="gid" unique="1"/>
                    <exit cond="qualified" url="http://ups.surveyrouter.com/soqualified.aspx?gid=${gid}"/>
                    <exit cond="terminated" url="http://ups.surveyrouter.com/soterminated.aspx?gid=${gid}"/>
                    <exit cond="overquota" url="http://ups.surveyrouter.com/soquotafull.aspx?gid=${gid}"/>
                  </samplesource>
                </samplesources>

                <number altlabel="record" fwidth="10" label="vrec" size="10" title="Record As Number" virtual="if record:  data[0][0] = int(record)"/>
                """

    FOOTER = """</survey>"""
    return[HEADER,FOOTER]

def newSurveySRG():
    HEADER = """<survey
             name="Survey"
             alt=""
             autosave="0"
             extraVariables="source,list,url,record,ipAddress,userAgent,flashDetected,decLang"
             compat="138"
             builderCompatible="1"
             secure="0"
             state="testing"
             setup="time,term,quota,decLang"
             mobile="compat"
             mobileDevices="smartphone,tablet,featurephone,desktop"
             ss:disableBackButton="1"
             ss:colorScheme="theme_red-01"
             fixedWidth="tight">

            <samplesources default="0">
              <samplesource list="0" title="default">
                <exit cond="qualified"><b>Thanks again for completing the survey!<br/><br/>Your feedback and quick response to this survey are greatly appreciated.</b></exit>
                <exit cond="terminated"><b>Thank you for your input!</b></exit>
                <exit cond="overquota"><b>Thank you for your input!</b></exit>
              </samplesource>
            </samplesources>"""
    FOOTER = """</survey>"""
    return[HEADER,FOOTER]

def newSurveyGMI():
    HEADER = """<survey
             name="Survey"
             alt=""
             autosave="1"
             autosaveKey="ac"
             extraVariables="source,list,url,record,ipAddress,userAgent,flashDetected,ac,sn,lang,co,decLang"
             setup="time,term,quota,decLang"
             ss:disableBackButton="1"
             displayOnError="all"
             unique=""
             compat="138"
             builderCompatible="1"
             secure="0"
             mobile="compat"
             mobileDevices="smartphone,tablet,featurephone,desktop"
             state="testing">

            <exec when="init">
            db_completed = Database( name="completed" )
            </exec>
            <exec>
            db_id = ac
            p.completedID = db_id
            </exec>

            <samplesources default="1">
              <completed>It seems you have already entered this survey.</completed>
              <invalid>You are missing information in the URL. Please verify the URL with the original invite.</invalid>
              <samplesource list="1" title="GMI">
                <var name="ac" unique="1"/>
                <var name="sn" required="1"/>
                <var name="lang" required="1"/>
                <exit cond="qualified" url="http://globaltestmarket.com/20/survey/finished.phtml?ac=${ac}&amp;sn=${sn}&amp;lang=${lang}"/>
                <exit cond="terminated" url="http://globaltestmarket.com/20/survey/finished.phtml?ac=${ac}&amp;sn=${sn}&amp;lang=${lang}&amp;sco=s"/>
                <exit cond="overquota" url="http://globaltestmarket.com/20/survey/finished.phtml?ac=${ac}&amp;sn=${sn}&amp;lang=${lang}&amp;sco=o"/>
              </samplesource>
            <samplesources>

            <html cond="db_completed.has(p.completedID)" final="1" label="dupe" where="survey">It seems you have already participated in this survey.</html>
            """
    FOOTER = """
                <exec when="finished">
                if gv.survey and gv.survey.root.state.live:
                    db_completed.add(p.completedID)
                </exec>

                </survey>"""
    return[HEADER,FOOTER]

def fixUniCode(input):
    input = input.replace(u"\u2019", "'").replace(u"\u2018", "'").replace(u"\u201C", "\"").replace(u"\u201D", "\"")
    input = re.sub('&\s', '&amp; ',input)
    return input


#need to find a better solution for the surveyType set up
class setSurveyType(sublime_plugin.TextCommand):
    def run(self, edit):
        sels = self.view.sel()
        sel = sels[0]
        surveyType = "<!-- surveyType="+self.view.substr(sel)+" -->"
        self.view.replace(edit,sel, surveyType)

################# Survey types

class makeSurveyCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)

            for sel in sels:
                printPage = ''
                input = self.view.substr(sel).strip()
                input = tidySurveyInput(input)
                #print input
                headerFooter =[]
                ### different variables dependant on survey type

                if docType =='CMB':
                    headerFooter = newSurveyCMB()
                    printPage = "%s\n\n%s\n\n%s" % (headerFooter[0], input, headerFooter[1])

                    headerFooter =[]
                elif docType =='EBA':
                    headerFooter = newSurveyEBAY()
                    printPage = "%s\n\n%s\n\n%s" % (headerFooter[0], input, headerFooter[1])
                    headerFooter =[]
                elif docType =='FMA':
                    headerFooter = newSurveyFMA()
                    printPage = "%s\n\n%s\n\n%s" % (headerFooter[0], input, headerFooter[1])
                    headerFooter =[]
                elif docType =='GDI':
                    headerFooter = newSurveyGDI()
                    printPage = "%s\n\n%s\n\n%s" % (headerFooter[0], input, headerFooter[1])
                    headerFooter =[]
                elif docType =='SRG':
                    headerFooter = newSurveySRG()
                    printPage = "%s\n\n%s\n\n%s" % (headerFooter[0], input, headerFooter[1])
                    headerFooter =[]
                elif docType =='GMI':
                    headerFooter = newSurveyGMI()
                    printPage = "%s\n\n%s\n\n%s" % (headerFooter[0], input, headerFooter[1])
                    headerFooter =[]
                else:
                    headerFooter = newSurvey()
                    printPage = "%s\n\n%s\n\n%s" % (headerFooter[0], input, headerFooter[1])
                    headerFooter =[]

                self.view.replace(edit,sel, printPage)
        except Exception:
            print ('could not create survey layout')
            print (e)


################# Question types
class makeRadioCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)

            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                inputLabelTitle = tidyQuestionInput(input)
                input = inputLabelTitle[0]
                label = inputLabelTitle[1]
                title = inputLabelTitle[2]
                alt = inputLabelTitle[3]

                if alt :
                  alt = "  <alt>%s</alt>\n"%(alt)
                else :
                  alt = ""

                if docType == 'CMB':
                    colCount = len(input.split("<col"))-1

                output = input

                # Custom Button Add
                class_name = setQuestionClassNames(output)
                class_name = '\n  %s'%(class_name) if not class_name == None else ''

                #test for and adjust comment for 2d question
                if output.strip() == '':
                    printpage = printPage = """
<radio 
  label=\"%s\"
  optional="1"
  where="execute">%s\t<title>(HIDDEN) %s</title>
  <row label="r0" value="0">False</row>
  <row label="r1" value="1">True</row>
</radio>
<suspend/>""" % (label.strip(), '\n%s'%(alt) if not alt == '' else '\n', title.strip())
                    return self.view.replace(edit,sel, printpage)


                if "<comment>" not in input:
                    if ("<row" in output) and ("<col" in output):
                        comment = "<comment></comment>\n" if docType != 'SRG' else  "<comment></comment>\n"
                    else:
                        comment = "<comment></comment>\n" if docType != 'SRG' else "<comment></comment>\n"

                # compose our new radio question
                if docType == 'FMA':
                    printPage = "<radio\n  label=\"%s\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</radio>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)
                elif docType == 'HAP':

                    rowlegend = ""

                    if ("<row" in output) and not ("<col" in output):
                        rowlegend='\n  rowLegend=\"right\"'

                    # compose our new radio question
                    if "<comment>" not in input:
                      printPage = "<radio\n  label=\"%s\"%s%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t%s\n</radio>\n<suspend/>" % (label.strip(), class_name, rowlegend, alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                    else:
                      printPage = "<radio\n  label=\"%s\"%s%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</radio>\n<suspend/>" % (label.strip(), class_name, rowlegend, alt, label.strip().replace('x', '-'), title.strip(), output)
                elif docType == 'CMB':
                        if (("<row" in output) and ("<col" in output) and (colCount > 1)) or not ("<row" in output):
                            style = ''
                        else:
                            style = '\n  style=\"noGrid\"\n  ss:questionClassNames=\"flexGrid\"'

                        # compose our new radio question
                        if "<comment>" not in input:
                          printPage = "<radio\n  label=\"%s\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t%s\n</radio>\n<suspend/>" % (label.strip(), style, alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                        else:
                          printPage = "<radio\n  label=\"%s\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</radio>\n<suspend/>" % (label.strip(), style, alt, label.strip().replace('x', '-'), title.strip(), output)

                else:
                    if "<comment>" not in input:
                      printPage = "<radio\n  label=\"%s\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t%s\n</radio>\n<suspend/>" % (label.strip(), class_name, alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                    else:
                      printPage = "<radio\n  label=\"%s\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</radio>\n<suspend/>" % (label.strip(), class_name, alt, label.strip().replace('x', '-'), title.strip(), output)


                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print ("makeRadio clip failed:")
            print (e)

class makeRatingCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            custom_rate = "\t<style copy=\"custom_rating\" arg:qmode=\"rating\" arg:autoContinue=\"false\" arg:autoNumber=\"true\" arg:btnDirection=\"row\" arg:leftText=\"\" arg:rightText=\"\" arg:showArrow=\"false\" arg:showGroup=\"true\" name=\"question.after\"/>\n"

            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                inputLabelTitle = tidyQuestionInput(input)
                input = inputLabelTitle[0]
                label = inputLabelTitle[1]
                title = inputLabelTitle[2]
                alt = inputLabelTitle[3]

                if alt :
                  alt = "  <alt>%s</alt>\n"%(alt)
                else :
                  alt = ''

                if docType == 'CMB':
                    rowCount = len(input.split("<row"))-1
                    colCount = len(input.split("<col"))-1

                output = input
                shffl = ""
                style = ""
                comment = ''

                if not "<row" in output and not "<insert" in output :
                    custom_rate = ""

                if docType == 'FMA':
                    printPage = "<radio\n  label=\"%s%s%s\"\n  type=\"rating\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</radio>\n<suspend/>" % (label.strip(), shffl, style, alt, label.strip().replace('x', '-'), title.strip(), output)

                elif docType == 'HAP':
                    #DETERMINE IF WE NEED A 1D OR 2D COMMENT, SHUFFLE 2D ROWS OR COLS, ADD AVERAGES attribute.
                    if ("<row" in output) and ("<col" in output):
                        comment = "<comment></comment>\n"
                        s = output.split("    ")
                        for x in s:
                            if x.count("value=") > 0:
                                if x.count("<col") > 0:
                                    shffl = "\n  shuffle=\"rows\""
                                # elif x.count("<row") > 0:
                                #     shffl = "\n  shuffle=\"cols\""
                    else:
                        comment = "<comment></comment>\n"

                    rowlegend=""

                    if ("<row" in output) and not ("<col" in output):
                        rowlegend='\n  rowLegend=\"right\"'

                    if "<comment>" not in input:
                        printPage = "<radio\n  label=\"%s\"%s%s\n  type=\"rating\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n%s\t%s\t%s\n</radio>\n<suspend/>" % (label.strip(), rowlegend, shffl, style, alt, label.strip().replace('x', '-'), title.strip(), custom_rate, comment, output)
                    else:
                        printPage = "<radio\n  label=\"%s\"%s%s\n  type=\"rating\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n%s\t%s\n</radio>\n<suspend/>" % (label.strip(), rowlegend, shffl, style, alt, label.strip().replace('x', '-'), title.strip(), custom_rate, output)

                elif docType == 'CMB':

                    if ("<row" in output) and ("<col" in output):
                        comment = "<comment></comment>\n"
                        s = output.split("    ")
                        for x in s:
                            if x.count("value=") > 0:
                                if x.count("<col") > 0:
                                    shffl = "\n  shuffle=\"rows\""
                                # elif x.count("<row") > 0:
                                #     shffl = "\n  shuffle=\"cols\""
                    else:
                        comment = "<comment></comment>\n"

                    if (("<row" in output) and ("<col" in output) and (colCount > 1)) or not ("<row" in output):
                        style = ''
                    else:
                        style = '\n  style=\"noGrid\" ss:questionClassNames=\"flexGrid\"'

                    if "<comment>" not in input:
                        printPage = "<radio\n  label=\"%s\"%s%s\n  type=\"rating\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n%s\t%s\t%s\n</radio>\n<suspend/>" % (label.strip(), shffl, style, alt, label.strip().replace('x', '-'), title.strip(), custom_rate, comment, output)
                    else:
                        printPage = "<radio\n  label=\"%s\"%s%s\n  type=\"rating\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n%s\t%s\n</radio>\n<suspend/>" % (label.strip(), shffl, style, alt, label.strip().replace('x', '-'), title.strip(), custom_rate, output)
                elif docType == 'SRG':

                    if (("row" in output) or ("rows" in output)) and (("col" in output) or ("cols" in output)):
                        comment = "<comment></comment>\n"
                        s = output.split("    ")
                        for x in s:
                            if x.count("value=") > 0:
                                if x.count("<col") > 0:
                                    shffl = "\n  shuffle=\"rows\""
                                # elif x.count("<row") > 0:
                                #     shffl = "\n  shuffle=\"cols\""
                    else:
                        comment = "<comment></comment>\n"

                    if "<comment>" not in input:
                        printPage = "<radio\n  label=\"%s\"%s%s\n  type=\"rating\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n%s\t%s\t%s\n</radio>\n<suspend/>" % (label.strip(), shffl, style, alt, label.strip().replace('x', '-'), title.strip(), custom_rate, comment, output)
                    else:
                        printPage = "<radio\n  label=\"%s\"%s%s\n  type=\"rating\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n%s\t%s\n</radio>\n<suspend/>" % (label.strip(), shffl, style, alt, label.strip().replace('x', '-'), title.strip(), custom_rate, output)


                else:
                    #DETERMINE IF WE NEED A 1D OR 2D COMMENT, SHUFFLE 2D ROWS OR COLS, ADD AVERAGES attribute.
                    if (("row" in output) or ("rows" in output)) and (("col" in output) or ("cols" in output)):
                        comment = "<comment></comment>\n"
                        s = output.split("    ")
                        for x in s:
                            if x.count("value=") > 0:
                                if x.count("<col") > 0:
                                    shffl = "\n  shuffle=\"rows\""
                                # elif x.count("<row") > 0:
                                #     shffl = "\n  shuffle=\"cols\""
                    else:
                        comment = "<comment></comment>\n"

                    if "<comment>" not in input:
                        printPage = "<radio\n  label=\"%s\"%s%s\n  type=\"rating\"\n  uses=\"atmtable.6\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n%s\t%s\t%s\n</radio>\n<suspend/>" % (label.strip(), shffl, style, alt, label.strip().replace('x', '-'), title.strip(), custom_rate, comment, output)
                    else:
                        printPage = "<radio\n  label=\"%s\"%s%s\n  type=\"rating\"\n  uses=\"atmtable.6\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n%s\t%s\n</radio>\n<suspend/>" % (label.strip(), shffl, style, alt, label.strip().replace('x', '-'), title.strip(), custom_rate, output)


                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print ("makeRating clip failed:")
            print (e)

class makeCheckboxCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                inputLabelTitle = tidyQuestionInput(input)
                input = inputLabelTitle[0]
                label = inputLabelTitle[1]
                title = inputLabelTitle[2]
                alt = inputLabelTitle[3]

                if alt :
                  alt = "  <alt>%s</alt>\n"%(alt)
                else :
                  alt = ''



                #checkbox specific
                rowCount = len(input.split("<row"))-1
                colCount = len(input.split("<col"))-1
                comment = ''
                # add the all important line breakage
                output2 = input

                # Custom Button Add
                class_name = setQuestionClassNames(output2)
                class_name = '\n  %s'%(class_name) if not class_name == None else ''

                inputSpl = output2.split('\n')
                output2 = []

                nota_array = [">None of the above",">None of these",">None of the Above",">None of These"]
                noAns = "<noanswer"
                for x in inputSpl:
                    output = ""
                    for nota in nota_array:
                        if nota in x and noAns not in x:
                            repwith = " exclusive=\"1\" randomize=\"0\"" + nota
                            output = x.replace(nota,repwith)

                    if output:
                        output2.append(output)
                    else:
                        output2.append(x)

                output = "\n".join(output2)
                if docType == 'CMB':
                    # set the appropriate comment
                    comment = "<comment></comment>\n"

                    if ("<row" in output) and ("<col" in output) and (colCount > 1):
                        style = ''
                    else:
                        style = '\n  style=\"noGrid\"\n  ss:questionClassNames=\"flexGrid\"'

                    # compose the question
                    if "<comment>" not in input:
                        printPage = "<checkbox\n  label=\"%s\"%s\n  atleast=\"1\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t%s\n</checkbox>\n<suspend/>" % (label.strip(), style, alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                    else:
                        printPage = "<checkbox\n  label=\"%s\"%s\n  atleast=\"1\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</checkbox>\n<suspend/>" % (label.strip(), style, alt, label.strip().replace('x', '-'), title.strip(), output)

                elif docType =='HAP':
                    comment = "<comment></comment>\n"
                    rowlegend=""

                    if ("<row" in output) and not ("<col" in output):
                        rowlegend ='\n  rowLegend=\"right\"'
                        # compose the question
                    if "<comment>" not in input:
                            printPage = "<checkbox\n  label=\"%s\"\n  atleast=\"1\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t %s\n</checkbox>\n<suspend/>" % (label.strip(), rowlegend, alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                    else:
                            printPage = "<checkbox\n  label=\"%s\"\n  atleast=\"1\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</checkbox>\n<suspend/>" % (label.strip(), rowlegend, alt, label.strip().replace('x', '-'), title.strip(), output)


                elif docType =='FMA':
                    # compose the question
                    printPage = "<checkbox\n  label=\"%s\"\n  atleast=\"1\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</checkbox>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)
                elif docType =='SRG':
                        comment = "<comment></comment>\n"
                        # compose the question
                        if "<comment>" not in input:
                            printPage = "<checkbox\n  label=\"%s\"\n  atleast=\"1\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t%s\n</checkbox>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                        else:
                            printPage = "<checkbox\n  label=\"%s\"\n  atleast=\"1\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</checkbox>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)
                else:
                        # set the appropriate comment
                    comment = "<comment></comment>\n"
                    # compose the question
                    if "<comment>" not in input:
                        printPage = "<checkbox\n  label=\"%s\"\n  atleast=\"1\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t%s\n</checkbox>\n<suspend/>" % (label.strip(), class_name, alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                    else:
                        printPage = "<checkbox\n  label=\"%s\"\n  atleast=\"1\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</checkbox>\n<suspend/>" % (label.strip(), class_name, alt, label.strip().replace('x', '-'), title.strip(), output)
                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print(e)

class makeSelectCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                inputLabelTitle = tidyQuestionInput(input)
                input = inputLabelTitle[0]
                label = inputLabelTitle[1]
                title = inputLabelTitle[2]
                alt = inputLabelTitle[3]

                if alt :
                  alt = "  <alt>%s</alt>\n"%(alt)
                else :
                  alt = ''

                #start from output = to fill this class
                output = input

                # compose the select question
                printPage = "<select\n  label=\"%s\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</select>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)

                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print(e)

class makeTextareaCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                inputLabelTitle = tidyQuestionInput(input)
                input = inputLabelTitle[0]
                label = inputLabelTitle[1]
                title = inputLabelTitle[2]
                alt = inputLabelTitle[3]

                if alt :
                  alt = "  <alt>%s</alt>\n"%(alt)
                else :
                  alt = ''

                #start from output = to fill this class
                output = input
                # if output != "":
                #   output = "  " + output + "\n"

                if docType == 'FMA':
                       printPage = "<textarea\n  label=\"%s\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s</textarea>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)
                else :

                    #COMPOSE OUR QUESTION
                    if "<comment>" not in input:
                        comment = "<comment></comment>"
                        printPage = "<textarea\n  label=\"%s\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n\t%s\n</textarea>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                    else:
                        printPage = "<textarea\n  label=\"%s\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</textarea>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)

                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print ("makeTextarea failed")
            print(e)

class makeTextCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                inputLabelTitle = tidyQuestionInput(input)
                input = inputLabelTitle[0]
                label = inputLabelTitle[1]
                title = inputLabelTitle[2]
                alt = inputLabelTitle[3]

                if alt :
                  alt = "  <alt>%s</alt>\n"%(alt)
                else :
                  alt = ''

                rowCount = len(input.split("<row"))-1
                colCount = len(input.split("<col"))-1
                #start from output = to fill this class
                # add the all important line breakage
                output = input
                # if output != "":
                #   output = "  " + output + "\n"

                if docType =='CMB':
                        if (("<row" in output) and ("<col" in output) and (colCount > 1)) or not ("<row" in output):
                            style = ''
                        else:
                            style = ' style=\"noGrid\"'
                        #COMPOSE OUR QUESTION
                        if "<comment>" not in input:
                            comment = "<comment></comment>\n"
                            printPage = "<text\n  label=\"%s\"\n  size=\"40\"\n  optional=\"0\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t%s\n</text>\n<suspend/>" % (label.strip(), style, alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                        else:
                            printPage = "<text\n  label=\"%s\"\n  size=\"40\"\n  optional=\"0\"%s>\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</text>\n<suspend/>" % (label.strip(), style, alt, label.strip().replace('x', '-'), title.strip(), output)

                elif docType =='FMA':
                    printPage = "<text\n  label=\"%s\"\n  size=\"40\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</text>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)

                else:
                    if "<comment>" not in input:
                        comment = "<comment></comment>"
                        printPage = "<text\n  label=\"%s\"\n  size=\"40\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n\t%s\n</text>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                    else:
                        printPage = "<text\n  label=\"%s\"\n  size=\"40\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</text>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)


                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)

class makeNumberCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                inputLabelTitle = tidyQuestionInput(input)
                input = inputLabelTitle[0]
                label = inputLabelTitle[1]
                title = inputLabelTitle[2]
                alt = inputLabelTitle[3]

                if alt :
                  alt = "  <alt>%s</alt>\n"%(alt)
                else :
                  alt = ''

                #start from output = to fill this class
                # add the all important line breakage
                output = input
                # if output != "":
                #     output = "  " + output + "\n"
                if docType =='FMA':
                    printPage = "<number\n  label=\"%s\"\n  size=\"3\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n%s</number>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)

                else:
                    #COMPOSE OUR QUESTION
                    if "<comment>" not in input:
                        comment = "<comment></comment>\n"
                        printPage = "<number\n  label=\"%s\"\n  size=\"3\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t%s\n</number>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                    else:
                        printPage = "<number\n  label=\"%s\"\n  size=\"3\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</number>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)

                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)

class makeFloatCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                inputLabelTitle = tidyQuestionInput(input)
                input = inputLabelTitle[0]
                label = inputLabelTitle[1]
                title = inputLabelTitle[2]
                alt = inputLabelTitle[3]
                
                if alt :
                  alt = "  <alt>%s</alt>\n"%(alt)
                else :
                  alt = ''

                #start from output = to fill this class
                # add the all important line breakage
                output = input
                # if output != "":
                #     output = "  " + output + "\n"
                if docType =='FMA':
                    printPage = "<float\n  label=\"%s\"\n  size=\"3\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</float>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)

                else:
                    #COMPOSE OUR QUESTION
                    if "<comment>" not in input:
                        comment = "<comment></comment>\n"
                        printPage = "<float\n  label=\"%s\"\n  size=\"3\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\t%s\n</float>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), comment, output)
                    else:
                        printPage = "<float\n  label=\"%s\"\n  size=\"3\"\n  optional=\"0\">\n%s\t<title><div class=\"q-name\">%s</div> %s</title>\n\t%s\n</float>\n<suspend/>" % (label.strip(), alt, label.strip().replace('x', '-'), title.strip(), output)

                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)


class makePipeCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:
            # sels = self.view.sel()
            # input = ''
            # #docType =  returnContext(self)
            # for sel in sels:
            #     printPage = ''
            #     input = self.view.substr(sel)
            #      # get rid of blank lines
            #     while "\n\n" in input:
            #         input = input.replace("\n\n", "\n")

            #     output = input

            #     # compose our new pipe tag
            #     printPage = "<pipe\n  label=\"\"\n  capture=\"\">\n  %s\n</pipe>\n" % (output)

            #     self.view.replace(edit,sel, printPage)
            sels = self.view.sel()[0]
            textr = self.view.substr(sels)
            set_text = '[pipe: %s]'%(textr)

            self.view.replace(edit,sels, set_text)

        except Exception as e:
            print ('make pipe failed')
            print (e)
############# QUESTION ELEMENTS ######################
def find_duplicates_list(lst):
    seen = set()
    duplicates = set()
    for item in lst:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    return list(duplicates)


def checkDupeElement(check_text) :
  printLabel = []
  printText = []

  for line in check_text.split('\n'):
      if line:
          # label 값 추출
          label_start = line.find('label="') + 7
          label_end = line.find('"', label_start)
          label = line[label_start:label_end]
          printLabel.append(label)

          # 텍스트 추출
          text_start = line.find('>') + 1
          text_end = line.find('</', text_start)
          text = line[text_start:text_end]
          text = text.strip().replace(' ', '').upper()
          printText.append(text)

  # 중복 검사
  duplicate_labels = find_duplicates_list(printLabel)
  duplicate_texts = find_duplicates_list(printText)

  raw_text = check_text
  if duplicate_labels :
    dup_label = ', '.join(duplicate_labels)
    raw_text += "<note>❌ ERROR Duplicate Label : %s</note>\n"%(dup_label)
  if duplicate_texts :
    dup_text = ', '.join(duplicate_texts)
    raw_text += "<note>❌ ERROR Duplicate Text : %s</note>\n"%(dup_text)

  return raw_text

class makeRowCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            for sel in sels:
                count = 0
                printPage = ''
                extra = ''
                input = self.view.substr(sel)
                #CLEAN UP THE TABS
                input = re.sub("\t+", " ", input)

                #CLEAN UP SPACES
                input = re.sub("\n +\n", "\n\n", input)

                #CLEAN UP THE EXTRA LINE BREAKS
                input = re.sub("\n{2,}", "\n", input)
                input = fixUniCode(input)

                input = input.strip().split("\n")
                #ebay has a different openSize
                openSize =  '45' if docType =='EBA' else '25'

                for x in range(0,len(input)):
                    input[x] = re.sub("^[a-zA-Z0-9]{1,2}[\.:\)][ \t]+", "", input[x])

                for x in input:

                    if ("other" in input[count].strip().lower() and "specify" in input[count].strip().lower()) or ("기타" in input[count].strip().lower() and "구체적" in input[count].strip().lower()):
                      input[count] = input[count].strip().replace("_", "")
                      extra=' open=\"1\" openSize=\"'+openSize+'\" randomize=\"0\"'
                    else:
                      extra = ''
                    printPage += "  <row label=\"r%s\"%s>%s</row>\n" % (str(count+1), extra, input[count].strip())
                    count += 1
                # thanks to replace the regions keep updated with their start and end point
                self.view.replace(edit,sel, checkDupeElement(printPage))

        except Exception as e:
            print (e)

class makeRowAutoValueCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            for sel in sels:
                count = 0
                printPage = ''
                extra = ''
                input = self.view.substr(sel)
                #CLEAN UP THE TABS
                input = re.sub("\t+", " ", input)

                #CLEAN UP SPACES
                input = re.sub("\n +\n", "\n\n", input)

                #CLEAN UP THE EXTRA LINE BREAKS
                input = re.sub("\n{2,}", "\n", input)
                input = fixUniCode(input)

                input = input.strip().split("\n")
                #ebay has a different openSize
                openSize =  '45' if docType =='EBA' else '25'

                for x in range(0,len(input)):
                    input[x] = re.sub("^[a-zA-Z0-9]{1,2}[\.:\)][ \t]+", "", input[x])

                for x in input:

                    if ("other" in input[count].strip().lower() and "specify" in input[count].strip().lower()) or ("기타" in input[count].strip().lower() and "구체적" in input[count].strip().lower()):
                      input[count] = input[count].strip().replace("_", "")
                      extra=' open=\"1\" openSize=\"'+openSize+'\" randomize=\"0\"'
                    else:
                      extra = ''
                    printPage += "  <row label=\"r%s\"%s value=\"%s\">%s</row>\n" % (str(count+1), extra, str(count+1), input[count].strip())
                    count += 1
                # thanks to replace the regions keep updated with their start and end point
                self.view.replace(edit,sel, checkDupeElement(printPage))

        except Exception as e:
            print (e)



class makeRowrCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            for sel in sels:
                printPage = ''
                extra = ''
                input = self.view.substr(sel)
                #CLEAN UP THE TABS
                input = re.sub("\t+", " ", input)

                #CLEAN UP SPACES
                input = re.sub("\n +\n", "\n\n", input)

                #CLEAN UP THE EXTRA LINE BREAKS
                input = re.sub("\n{2,}", "\n", input)
                input = fixUniCode(input)

                input = input.strip().split("\n")
                #ebay has a different openSize
                openSize =  '45' if docType =='EBA' else '25'
                counter = 0
                count = len(input)

                for x in range(0,len(input)):
                    input[x] = re.sub("^[a-zA-Z0-9]{1,2}[\.:\)][ \t]+", "", input[x])

                for x in input:

                    if ("other" in input[count-1].strip().lower() and "specify" in input[count-1].strip().lower()) or ("기타" in input[count-1].strip().lower() and "구체적" in input[count-1].strip().lower()):
                      input[count-1] = input[count-1].replace("_", "")
                      extra=' open=\"1\" openSize=\"'+openSize+'\" randomize=\"0\"'
                    else:
                      extra = ''
                    printPage += "  <row label=\"r%s\"%s>%s</row>\n" % (str(count), extra, input[counter].strip())
                    count -= 1
                    counter +=1
                # thanks to replace the regions keep updated with their start and end point
                self.view.replace(edit,sel, checkDupeElement(printPage))

        except Exception as e:
            print (e)


class makeRowsMatchLabelCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel).strip()
                input = fixUniCode(input)
                #SPLIT UP INTO ROWS
                input = input.split("\n")
                #ebay has a different openSize
                openSize =  '45' if docType =='EBA' else '25'
                #ITERATE ROWS
                count = 0
                for line in input:
                     line = line.strip()
                     #SPLIT ON WHITESPACE -- REMOVE LEADING AND TRAILING WS
                     parts = re.split(r"\s",line,1)

                     #GET RID OF EXTRA SPACES
                     ordinal= parts[0].strip()
                     ordinal= ordinal.rstrip('.')
                     ordinal= ordinal.rstrip(')')

                     #GET RID OF EXTRA SPACES
                     if len(parts) == 2:
                       content = parts[1].strip()


                     extra=""

                     if ("other" in content.lower() and "specify" in content.lower()) or ("기타" in content.lower() and "구체적" in content.lower()):
                       content = content.replace("_", "")
                       extra=' open=\"1\" openSize=\"'+openSize+'\" randomize=\"0\"'

                     #COMPOSE ROW
                     if ordinal[0].isalpha() and (len(parts) == 2):
                       printPage += "  <row label=\"%s\"%s>%s</row>\n" % (ordinal, extra, content)
                     elif ordinal[0].isdigit():
                       printPage += "  <row label=\"r%s\"%s>%s</row>\n" % (ordinal, extra, content)
                     elif (len(parts) == 2):
                       printPage += "  <row label=\"%s\"%s>%s</row>\n" % (ordinal, extra, content)
                     else:
                       count += 1
                       printPage += "  <row label=\"r%s\"%s>%s</row>\n" % (str(count), extra, line)

                self.view.replace(edit,sel, checkDupeElement(printPage))
        except Exception as e:
            print (e)

class makeRowsMatchValuesCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                input = fixUniCode(input)
                #SPLIT UP INTO ROWS
                input = input.split("\n")
                #ebay has a different openSize
                openSize =  '45' if docType =='EBA' else '25'
                #ITERATE ROWS
                for line in input:
                    line = line.strip()
                    
                    #SPLIT ON WHITESPACE -- REMOVE LEADING AND TRAILING WS
                    parts = re.split(r"\s",line,1)

                    #GET RID OF EXTRA SPACES
                    ordinal= parts[0].strip()

                    

                    ordinal= ordinal.rstrip('.')
                    ordinal= ordinal.rstrip(')')


                    #GET RID OF EXTRA SPACES
                    if len(parts) == 2:
                        content = parts[1].strip()

                    extra=""

                    if ("other" in content.lower() and "specify" in content.lower()) or ("기타" in content.lower() and "구체적" in content.lower()):
                        content = content.replace("_", "")
                        extra=' open=\"1\" openSize=\"'+openSize+'\" randomize=\"0\"'

                    #COMPOSE ROW
                    printPage += "  <row label=\"r%s\" value=\"%s\"%s>%s</row>\n" % (ordinal,ordinal, extra, content)

                self.view.replace(edit,sel, checkDupeElement(printPage))
        except Exception as e:
            print (e)

class makeColsCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            #docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                input = re.sub("\t+", " ", input)
                #CLEAN UP SPACES
                input = re.sub("\n +\n", "\n\n", input)
                #CLEAN UP THE EXTRA LINE BREAKS
                input = re.sub("\n{2,}", "\n", input)
                input = fixUniCode(input)
                input = input.strip().split("\n")
                #start from output = to fill this class
                for x in range(0,len(input)):
                    input[x] = re.sub("^[a-zA-Z0-9]{1,2}[\.:\)][ \t]+", "\n", input[x])
                count = 0
                for x in input:
                    if ("other" in input[count].strip().lower() and "specify" in input[count].strip().lower()) or ("기타" in input[count].strip().lower() and "구체적" in input[count].strip().lower()):
                        input[count] = input[count].strip().replace("_", "")
                        extra=' open=\"1\" openSize=\"25\" randomize=\"0\"'
                        printPage += "  <col label=\"c%s\"%s>%s</col>\n" % (str(count+1), extra, input[count].strip())
                        count += 1
                    else:
                        extra = ''

                        printPage += "  <col label=\"c%s\"%s>%s</col>\n" % (str(count+1), extra, input[count].strip())
                        count += 1

                self.view.replace(edit,sel, checkDupeElement(printPage))
        except Exception as e:
            print (e)

class makeColsMatchLabelCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            #docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                input = fixUniCode(input)
                input = re.sub("\t+", " ", input)
                #CLEAN UP SPACES
                input = re.sub("\n +\n", "\n\n", input)
                #CLEAN UP THE EXTRA LINE BREAKS
                input = re.sub("\n{2,}", "\n", input)
                input = input.strip().split("\n")
                count = 0
                for line in input:
                     line = line.strip()
                     #SPLIT ON WHITESPACE -- REMOVE LEADING AND TRAILING WS
                     parts = re.split(r"\s",line,1)

                     #GET RID OF EXTRA SPACES
                     ordinal= parts[0].strip()
                     ordinal= ordinal.rstrip('.')
                     ordinal= ordinal.rstrip(')')

                     #GET RID OF EXTRA SPACES
                     if len(parts) == 2:
                       content = parts[1].strip()

                     extra=""

                     if ("other" in content.lower() and "specify" in content.lower()) or ("기타" in content.lower() and "구체적" in content.lower()):
                       content = content.replace("_", "")
                       extra=' open=\"1\" openSize=\"25\" randomize=\"0\"'

                     #COMPOSE ROW
                     if ordinal[0].isalpha() and (len(parts) == 2):
                       printPage += "  <col label=\"%s\"%s>%s</col>\n" % (ordinal, extra, content)
                     elif ordinal[0].isdigit():
                       printPage += "  <col label=\"c%s\"%s>%s</col>\n" % (ordinal, extra, content)
                     else:
                       count += 1
                       printPage += "  <col label=\"c%s\"%s>%s</col>\n" % (str(count), extra, line)

                self.view.replace(edit,sel, checkDupeElement(printPage))
        except Exception as e:
            print (e)

class makeColsMatchValueCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            #docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                input = re.sub("\t+", " ", input)
                #CLEAN UP SPACES
                input = re.sub("\n +\n", "\n\n", input)
                #CLEAN UP THE EXTRA LINE BREAKS
                input = re.sub("\n{2,}", "\n", input)
                input = fixUniCode(input)
                input = input.strip().split("\n")

                for line in input:
                     line = line.strip()
                     #SPLIT ON WHITESPACE -- REMOVE LEADING AND TRAILING WS
                     parts = re.split(r"\s",line,1)

                     #GET RID OF EXTRA SPACES
                     ordinal= parts[0].strip()
                     ordinal= ordinal.rstrip('.')
                     ordinal= ordinal.rstrip(')')

                     #GET RID OF EXTRA SPACES
                     content = parts[1].strip()

                     extra=""

                     if ("other" in content.lower() and "specify" in content.lower()) or ("기타" in content.lower() and "구체적" in content.lower()):
                       content = content.replace("_", "")
                       extra=' open=\"1\" openSize=\"25\" randomize=\"0\"'

                     #COMPOSE COLUMN
                     printPage += "  <col label=\"c%s\" value=\"%s\"%s>%s</col>\n" % (ordinal,ordinal, extra, content)

                self.view.replace(edit,sel, checkDupeElement(printPage))
        except Exception as e:
            print (e)

class makeChoicesCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                input = fixUniCode(input)
                input = input.strip().split("\n")

                for x in range(0,len(input)):
                    input[x] = re.sub("^[a-zA-Z0-9]{1,2}[\.:\)][ \t]+", "\n", input[x])
                count = 0
                for x in input:
                    printPage += "  <choice label=\"ch%s\">%s</choice>\n" % (str(count+1), input[count].strip())
                    count += 1
            self.view.replace(edit,sel, checkDupeElement(printPage))
        except Exception as e:
            print (e)

class makeCasesCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                input = fixUniCode(input)
                while '\n\n' in input:
                    input = input.replace('\n\n', '\n')
                input = input.strip().split("\n")

                for x in range(0,len(input)):
                    input[x] = re.sub("^[a-zA-Z0-9]{1,2}[\.:\)][ \t]+", "\n", input[x])
                count = 0
                for x in input:
                    printPage += "  <case label=\"r%s\" cond=\"\">%s</case>\n" % (str(count+1), input[count].strip())
                    count += 1
                printPage += "  <case label=\"%s\" cond=\"1\">UNDEFINED</case>" % ("null")
                printPage = "<pipe\n  label=\"\"\n  capture=\"\">\n" + printPage + "\n</pipe>"
            self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)

class makeGroupsCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                input = fixUniCode(input)
                input = input.strip().split("\n")

                for x in range(0,len(input)):
                    input[x] = re.sub("^[a-zA-Z0-9]{1,2}[\.:\)][ \t]+", "\n", input[x])
                for x in range(len(input)):
                    printPage += "  <group label=\"g" + str(x+1) + "\">" + re.sub(r"^[a-zA-Z0-9]+(\.|:)|^[a-zA-Z0-9]+[a-zA-Z0-9]+(\.|:)", "", input[x]).strip() + "</group>\n"
            self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)

class makeLoopBlockCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel).strip()
                input = re.sub(r'<(radio|checkbox|text|textarea|block|number|float|select|html)(.*) label="([^"]*)"',r'<\1\2 label="\3_[loopvar: label]"', input)

                printPage = """
<loop
  label=""
  vars="">
  
<block
  label="">

%s

</block>

<looprow label="" cond=""><loopvar name=""></loopvar></looprow>
</loop>""" % input

                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)


class makeSwitchCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:
            sels = self.view.sel()
            for sel in sels:

                vrange = self.view.substr(sel).strip("\n").split("\n")

                for i in range(len(vrange)):

                    if "<row" in vrange[i]:
                        this1 = "row"
                        that1 = "col"
                        this2 = "r"
                        that2 = "c"
                    elif "<col" in vrange[i]:
                        this1 = "col"
                        that1 = "row"
                        this2 = "c"
                        that2 = "r"
                    vrange[i] = re.sub("(<|\/)" + this1, r'\1' + that1, vrange[i])
                    vrange[i] = re.sub('label="%s' % this2, 'label="%s' % that2, vrange[i])

                vrange = "\n".join(vrange)
                self.view.replace(edit,sel, vrange)
        except Exception as e:
            print (e)

class makeCommentCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel).strip()
                input = fixUniCode(input)
                input = input.replace("\n", "<br/>\n")
                printPage = "<html\n  label=\"\"\n  where=\"survey\">%s</html>" % input

                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)


class makeColsWithGroupCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:

            sels = self.view.sel()
            input = ''
            #docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)
                input = re.sub("\t+", " ", input)
                #CLEAN UP SPACES
                input = re.sub("\n +\n", "\n\n", input)
                #CLEAN UP THE EXTRA LINE BREAKS
                input = re.sub("\n{2,}", "\n", input)
                input = fixUniCode(input)
                input = input.strip().split("\n")

                group_check = re.split(r"\s", input[0], 1)[0]
                group_text = ""
                if not group_check.isdigit() :
                  group_text = input[0]
                  input = input[1:]

                printPage += "  <group label=\"g1\">%s</group>\n"%(group_text)

                for line in input:
                     line = line.strip()
                     #SPLIT ON WHITESPACE -- REMOVE LEADING AND TRAILING WS
                     parts = re.split(r"\s",line,1)

                     #GET RID OF EXTRA SPACES
                     ordinal= parts[0].strip()
                     ordinal= ordinal.rstrip('.')
                     ordinal= ordinal.rstrip(')')

                     #GET RID OF EXTRA SPACES
                     content = parts[1].strip()

                     extra=""

                     if ("other" in content.lower() and "specify" in content.lower()) or ("기타" in content.lower() and "구체적" in content.lower()):
                       content = content.replace("_", "")
                       extra=' open=\"1\" openSize=\"25\" randomize=\"0\"'

                     #COMPOSE COLUMN
                     printPage += "  <col label=\"c%s\" groups=\"g1\" value=\"%s\"%s>%s</col>\n" % (ordinal,ordinal, extra, content)

                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)



### NIQ KOR
def index_exists(arr, i):
    return (0 <= i < len(arr)) or (-len(arr) <= i < 0)


class makeStrongCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                set_text = '<b>{}</b>'.format(textr)
                self.view.replace(edit,sels, set_text)
                
            except Exception as e:
                print (e) 

class makeAltCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                set_text = '<alt>{}</alt>'.format(textr.strip())
                self.view.replace(edit,sels, set_text)
                
            except Exception as e:
                print (e) 


class makeQnameCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                textr = textr.replace('x', '-')
                set_text = '<div class=\"q-name\">{}</div> '.format(textr)
                self.view.replace(edit,sels, set_text)
                
            except Exception as e:
                print (e) 

class makeUnderlineCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                set_text = '<u>{}</u>'.format(textr)
                self.view.replace(edit,sels, set_text)
                
            except Exception as e:
                print (e) 

class makeStrongColorCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                set_text = '<span class=\"f-highlight\">{}</span>'.format(textr)
                self.view.replace(edit,sels, set_text)
                
            except Exception as e:
                print (e)

class makeUnderlineColorCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                set_text = '<span class=\"f-highlight\"><u>{}</u></span>'.format(textr)
                self.view.replace(edit,sels, set_text)
                
            except Exception as e:
                print (e) 


class makeVideoCommand(sublime_plugin.TextCommand) :
    def run (self, edit):
      try :
        sels = self.view.sel()
        
        for sel in sels :
          input = self.view.substr(sel)

          if '\n' in input :
            findn = input.find('\n')
            title = input[findn:]
            input = input[:findn]
          else :
            title = ''

          inputLabelTitle = tidyQuestionInput(input)
          input = inputLabelTitle[0]
          label = inputLabelTitle[1]
          videoID = inputLabelTitle[2]
          videoText = """
<text 
  label="%s"
  optional="0"
  size="25"
  sst="0"
  uses="videoplayer.1"
  videoplayer:player_id="SybkoGSJb"
  videoplayer:video_id="%s">
  <title>%s</title>
</text>
<suspend/>"""%(label.strip(), videoID.strip(),title.strip())
          return self.view.replace(edit,sel,videoText)

          
      except :
        print('video make error')


class makeRowsMatchValuesGroupCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            #print self.view.settings()
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)

                groupSplit = input.split("\n")
                groupSplit = [i for i in groupSplit if not i.strip()==""]

                groupcnt = 1
                otherGroup = 98

                for ix,tx in enumerate(groupSplit) :
                    chk = tx.replace("\t\t"," ").replace("\t"," ").find(" ")
                    groupchk = tx[:chk]
                    
                    if not groupchk.isdigit() :
                        otherText = ["기타","없음","other","others","none"]
                        extra = ""
                        otherchk = tx.strip().replace(" ","").lower()
                        if otherchk in otherText :
                            extra = ' randomize="0"'
                            gcnt = otherGroup
                        else :
                            gcnt = groupcnt

                        groupSplit[ix] = '<group label="g%s"%s>%s</group>'%(gcnt,extra,tx.strip())

                        if otherchk in otherText :
                            otherGroup = otherGroup + 1
                        else :
                            groupcnt = groupcnt + 1

                
                groupIndex = [i for i in range(0,len(groupSplit)) if "<group" in groupSplit[i]]

                groupInput = [groupSplit[groupIndex[g]:groupIndex[g+1]] if index_exists(groupIndex, g+1) else groupSplit[groupIndex[g]:] for g in range(0,len(groupIndex)) ]

                groupDict = {ix:[tx[0].strip(),tx[1:]] for ix,tx in enumerate(groupInput)}
                
                
                printPage = ''

                for inp in sorted(groupDict.items()) :
                    groupTag = inp[1][0]
                    
                    groupText = groupTag.replace(' randomize="0"','').replace('"','').split("label=")[1]
                    splitcnt = groupText.find(">")
                    
                    groupLabel = groupText[:splitcnt]

                    input = '\n'.join(inp[1][1])
                    input = input.strip()
                    input = fixUniCode(input)


                    
                    #SPLIT UP INTO ROWS
                    input = input.split("\n")
                    #ebay has a different openSize
                    openSize =  '45' if docType =='EBA' else '25'
                    #ITERATE ROWS
                    printPage += "%s\n"%(groupTag)

                    for line in input :
                        if inp :
                            line = line.strip()
                            #SPLIT ON WHITESPACE -- REMOVE LEADING AND TRAILING WS
                            parts = re.split(r"\s",line,1)

                            #GET RID OF EXTRA SPACES
                            ordinal= parts[0].strip()
                            ordinal= ordinal.rstrip('.')
                            ordinal= ordinal.rstrip(')')

                            content = ''

                            #GET RID OF EXTRA SPACES
                            if len(parts) == 2:
                                content = parts[1].strip()

                            extra=""
                            otherArr1 = ["기타","other","others"]
                            otherArr2 = ["구체적","자세히","specify"]

                            noneArr = ["모름","없음","none"]

                            if [i for i in otherArr1 if i.lower() in content.lower()] and [i for i in otherArr2 if i.lower() in content.lower()] :
                               content = content.replace("_", "")
                               extra=' open=\"1\" openSize=\"'+openSize+'\" randomize=\"0\"'
                            elif [i for i in noneArr if i.lower() in content.lower()] :
                               content = content.replace("_", "")
                               extra=' exclusive=\"1\" randomize=\"0\"'


                            #COMPOSE ROW
                            printPage += "  <row label=\"r%s\" groups=\"%s\" value=\"%s\"%s>%s</row>\n" % (ordinal,groupLabel,ordinal, extra, content)


                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)




class changeLabelCodeCommand(sublime_plugin.TextCommand) :
    def run (self,edit):
        try:
            sels = self.view.sel()
            
            for sel in sels :
                s = self.view.substr(sel)
                s = s.strip()
                s = s.replace('\t',' ')
                
                s = [i.strip() for i in s.split("\n") if not i.strip()==""]

                st = [i.split("\t\t") if "\t\t" in i else [i[:i.rfind(" ")].strip(),i[i.rfind(" "):].strip()] if i[i.rfind(" "):].strip().isdigit() else [i.strip(),""] for i in s]

                set_text = ["%s\t\t%s"%(0 if i[1] == "0" else i[1].lstrip("0"),i[0].strip()) for i in st]

                printPage = ""

                for p in set_text :
                    printPage += "%s\n"%p
                
                self.view.replace(edit,sel, printPage)

        except Exception as e:
            print (e)

class gridColCommand(sublime_plugin.TextCommand) :
    def run (self,edit):
        try:
            sels = self.view.sel()
            
            for sel in sels :
                s = self.view.substr(sel)
                s = s.replace("\n","")
                s = s.replace("[","**(")
                s = s.replace("]",")__")
                s = [i.strip() for i in s.split("__")]
                s = " ".join(s)
                s = s.split("**")


                printPage = ""

                for i in s :
                    if "(" in i and ")" in i :
                        ix1 = i.find("(")
                        ix2 = i.find(")")
                        icode = i[ix1+1:ix2]
                        printPage += "%s\t%s\n"%(icode,i.strip())

                self.view.replace(edit,sel, printPage)

        except Exception as e:
            print (e)

#view.run_command('make_syntax')

def getOtions(qText) :
    optionTag = qText[qText.find('<')+1:qText.find('>')].split("\n")
    optionDict = {o.split('=')[0]:o.split('=')[1].replace('"','').strip() for o in optionTag if '=' in o}

    return optionDict

def getElementOptions(qText) :
    optionTag = qText[qText.find('<')+1:qText.find('>')].replace('"','')
    optionTag = optionTag.replace(' ','\n')
    optionTag = optionTag.split('\n')
    optionTag = {i.split('=')[0]:i.split('=')[1] for i in optionTag if '=' in i}
    
    return optionTag

def makeElements(lines,defineDict) :
    rowLabels = []
    rowValues = []
    colLabels = []
    colValues = []
    choiceLabels = []
    choiceValues = []
    noanswerLabels = []
    noanswerValues = []

    for l in lines :
        if '<row' in l.strip() :
            rowLabels.append(getElementOptions(l.strip())['label'].upper().replace('/',''))

            if 'value' in l.strip() :
                rowValues.append(int(getElementOptions(l.strip())['value'].upper().replace('/','')))

        if '<insert' in l.strip() and ('rows' in l.strip() or (not 'cols' in l.strip() and not 'choices' in l.strip()) ):
            defineLabel = getElementOptions(l.strip())['source'].replace('/','')
            dfList = defineDict[defineLabel]
            for i in dfList[0] :
                rowLabels.append(i)
            for v in dfList[1] :
                rowValues.append(v)

        if '<col' in l.strip() :
            colLabels.append(getElementOptions(l.strip())['label'].upper().replace('/',''))

            if 'value' in l.strip() :
                colValues.append(int(getElementOptions(l.strip())['value'].upper().replace('/','')))

        if '<insert' in l.strip() and 'cols' in l.strip () :
            defineLabel = getElementOptions(l.strip())['source'].replace('/','')
            dfList = defineDict[defineLabel]
            for i in dfList[0] :
                colLabels.append(i)
            for v in dfList[1] :
                colValues.append(v)

        if '<choice' in l.strip() :
            choiceLabels.append(getElementOptions(l.strip())['label'].upper().replace('/',''))

            if 'value' in l.strip() :
                choiceValues.append(int(getElementOptions(l.strip())['value'].upper().replace('/','')))

        if '<insert' in l.strip() and 'choices' in l.strip () :
            defineLabel = getElementOptions(l.strip())['source'].replace('/','')
            dfList = defineDict[defineLabel]
            for i in dfList[0] :
                choiceLabels.append(i)
            for v in dfList[1] :
                choiceValues.append(v)

        if '<noanswer' in l.strip() :
            noanswerLabels.append(getElementOptions(l.strip())['label'].upper().replace('/',''))

            if 'value' in l.strip() :
                noanswerValues.append(int(getElementOptions(l.strip())['value'].upper().replace('/','')))

    returnDict = {
        'rowLabels':rowLabels,
        'rowValues':rowValues,
        'colLabels':colLabels,
        'colValues':colValues,
        'choiceLabels':choiceLabels,
        'choiceValues':choiceValues,
        'noanswerLabels':noanswerLabels,
        'noanswerValues':noanswerValues
    }

    return returnDict

def returnNoanswer(qid,noanswerLabels, noanswerValues):
    noanswerSyntax = []
    noanswer = 'noanswer%s_%s'
    if noanswerLabels :
        for nt in noanswerLabels :
            navalname = noanswer%(qid,nt)
            na = "%s=0"%(navalname)
            noanswerSyntax.append(na)

    return noanswerSyntax

def sumSyntax(baseid,firstvar,lastvar) :
    amountchk = {
        'sumID': '%s_SUM'%(baseid),
        'syntax' : 'COMPUTE %s_SUM=SUM(%s TO %s).\n'%(baseid,firstvar,lastvar)
    }
    return amountchk

def selectUnique(qlabel,rowLabels,colLabels,option) :
    uniqueSyntax = ''
    dupchk = "!DUPCHK %s.\n"
    if option == 'cols' :
        uniqueList = []
        if colLabels :
            for c in colLabels :
                for r in rowLabels :
                    saLabel = '%s%s%s'%(qlabel,r,c)
                    uniqueList.append(saLabel)

                setVars = '%s TO %s'%(uniqueList[0],uniqueList[-1])
                uniqueSyntax += dupchk%setVars
        else :
            for r in rowLabels :
                saLabel = '%s%s'%(qlabel,r)
                uniqueList.append(saLabel)

            setVars = '%s TO %s'%(uniqueList[0],uniqueList[-1])
            uniqueSyntax += dupchk%setVars

    if option == 'rows' :
        uniqueList = []
        if rowLabels :
            for r in rowLabels :
                for c in colLabels :
                    saLabel = '%s%s%s'%(qlabel,r,c)
                    uniqueList.append(saLabel)

                setVars = '%s TO %s'%(uniqueList[0],uniqueList[-1])
                uniqueSyntax += dupchk%setVars
        else :
            for c in colLabels :
                saLabel = '%s%s'%(qlabel,c)
                uniqueList.append(saLabel)

            setVars = '%s TO %s'%(uniqueList[0],uniqueList[-1])
            uniqueSyntax += dupchk%setVars


    return uniqueSyntax


class makeSyntaxCommand(sublime_plugin.TextCommand) :
    def run (self,edit):
        try:
            sels = self.view.sel()
            
            for sel in sels :
                ss = self.view.substr(sel)
                s = ss.split('\n')
                s = [i for i in s if not i.strip() == ""]
                qidArr = []

                allType = ["radio","checkbox","number","float","text","textarea","select","block"]

                startQtype = ["<%s"%t for t in allType]
                endQtype = ["</%s>"%t for t in allType]

                safreq = "!SAFREQ %s.\n"
                mafreq = "!MAFREQ %s.\n"
                dupchk = "!DUPCHK %s.\n"
                temps = "TEMP.\n"
                textchk = "FREQ %s.\n"

                qAttr = {}
                defineDict = {}

                syntax = '* !!! Check please variable is set to survey order !!!.'

                for (ix,tx) in enumerate(s) :
                    #define list 
                    if '<define' in tx.strip() :
                        starts = s[ix:]
                        endTag = "</define>"
                        qText = ""
                        for st in starts :
                            if endTag in st.strip() :
                                qText += "%s\n"%st.strip()
                                break
                            else :
                                qText += "%s\n"%st.strip()

                        lines = qText.split('\n')
                        defineLabel = getElementOptions(lines[0].strip())['label']
                        defineRowsLabel = [getElementOptions(l.strip())['label'].upper() for l in lines if '<row' in l.strip()]
                        defineRowsValue = [int(getElementOptions(l.strip())['value'].upper()) for l in lines if '<row' in l.strip() and 'value' in l.strip()]

                        defineDict[defineLabel]=[defineRowsLabel,defineRowsValue]

                    if '<block' in tx.strip() :
                        starts = s[ix:]
                        endTag = "</block>"
                        qText = ""
                        for st in starts :
                            if endTag in st.strip() :
                                qText += "%s\n"%st.strip()
                                break
                            else :
                                qText += "%s\n"%st.strip()

                        lines = qText.split('\n')
                        blockLabel = getElementOptions(lines[0].strip())['label']
                        
                        syntax +='\n*_______ Block = %s _______.'%(blockLabel)

                    if '<image' in tx.strip() :
                        starts = s[ix:]
                        endTag = "</image>"
                        qText = ""
                        for st in starts :
                            if endTag in st.strip() :
                                qText += "%s\n"%st.strip()
                                break
                            else :
                                qText += "%s\n"%st.strip()

                        lines = qText.split('\n')
                        imgLabel = getElementOptions(lines[0].strip())['label']
                        
                        syntax += '\n*%s is Image Uploader.\n'%(imgLabel)
                        syntax += temps

                        noanswerLabels = makeElements(lines,defineDict)['noanswerLabels']
                        noanswerValues = makeElements(lines,defineDict)['noanswerValues']

                        noanswerSyntax = returnNoanswer(qlabel,noanswerLabels,noanswerValues)

                        if noanswerSyntax :
                            syntax += 'SEL IF (%s).\n'%(' AND '.join(noanswerSyntax))

                        syntax += textchk%(imgLabel)

                    if tx.strip() in startQtype :
                        syntax += '\n'
                        starts = s[ix:]
                        stype = starts[0].replace("<","").strip()
                        endTag = "</%s>"%(stype)
                        qText = ""
                        labelText = ""
                        for st in starts :
                            if st.strip() == endTag :
                                qText += endTag
                                break
                            else :
                                qText += "%s\n"%st.strip()

                        options = getOtions(qText)
                        lines = qText.split('\n')
                        qlabel = options['label'].upper()

                        print(qlabel)
                        rowLabels = makeElements(lines,defineDict)['rowLabels']
                        rowValues = makeElements(lines,defineDict)['rowValues']
                        colLabels = makeElements(lines,defineDict)['colLabels']
                        colValues = makeElements(lines,defineDict)['colValues']
                        choiceLabels = makeElements(lines,defineDict)['choiceLabels']
                        choiceValues = makeElements(lines,defineDict)['choiceValues']
                        noanswerLabels = makeElements(lines,defineDict)['noanswerLabels']
                        noanswerValues = makeElements(lines,defineDict)['noanswerValues']

                        if 'where' in options and 'execute' in options['where'] :
                            syntax += '*%s is Hidden Question.\n'%(qlabel)

                        if 'onLoad' in qText and 'copy(' in qText :
                            for l in lines :
                                if 'onLoad' in l.strip() :
                                    copyText = l.strip().replace('"','').replace("'",'').replace('<','').replace('>','')
                                    copyText = copyText[copyText.find("(")+1:copyText.find(")")].replace(" ","")
                                    copyText = copyText.split(',')

                                    copyDict = {'qid':copyText[0]}
                                    for cp in copyText :
                                        if '=' in cp :
                                            copyDict[cp.split('=')[0]] = cp.split('=')[1]

                                    if 'rows' in copyDict :
                                        if copyDict['rows'] == 'True' :
                                            rowLabels = qAttr[copyDict['qid']]['rows'][0].copy()
                                            rowValues = qAttr[copyDict['qid']]['rows'][1].copy()

                                    if 'cols' in copyDict :
                                        if copyDict['cols'] == 'True' :
                                            colLabels = qAttr[copyDict['qid']]['cols'][0].copy()
                                            colValues = qAttr[copyDict['qid']]['cols'][1].copy()

                                    if 'choices' in copyDict :
                                        if copyDict['choices'] == 'True' :
                                            choicesLabels = qAttr[copyDict['qid']]['choices'][0].copy()
                                            choicesValues = qAttr[copyDict['qid']]['choices'][1].copy()

                        

                        qAttr[qlabel] = {
                            'index': ix,
                            'type' : stype,
                            'rows' : [rowLabels,rowValues],
                            'cols' : [colLabels,colValues],
                            'choices' : [choiceLabels,choiceValues],
                            'noanswer' : [noanswerLabels,noanswerValues]
                        }
                        
                        noanswerSyntax = returnNoanswer(qlabel,noanswerLabels,noanswerValues)

                        #radio (SA)
                        if stype == 'radio' :
                            #grouping cols 
                            if 'grouping' in options :
                                if options['grouping'] == 'cols' :
                                    for c in colLabels :
                                        cLabel = '%s%s'%(qlabel,c)

                                        if noanswerSyntax :
                                            cLabel = '%s / (%s)'%(cLabel,' AND '.join(noanswerSyntax))

                                        syntax += safreq%(cLabel)

                                    #rank col
                                    if 'unique' in options :
                                        toText = '%s TO %s'%('%s%s'%(qlabel,colLabels[0]),'%s%s'%(qlabel,colLabels[-1]))
                                        syntax += dupchk%(toText)
                            
                            #grid
                            elif rowLabels and colLabels :
                                for r in rowLabels :
                                    rLabel = '%s%s'%(qlabel,r)

                                    if noanswerSyntax :
                                        rLabel = '%s / (%s)'%(rLabel,' AND '.join(noanswerSyntax))

                                    syntax += safreq%(rLabel)

                            #defalut SA
                            else :
                                saLabel = qlabel

                                if noanswerSyntax :
                                    saLabel = '%s / (%s)'%(saLabel,' AND '.join(noanswerSyntax))

                                syntax += safreq%(saLabel)

                        #checkbox 
                        if stype == 'checkbox' :
                            #row and col
                            if rowLabels and colLabels :
                                if 'grouping' in options and options['grouping'] == 'cols':
                                        for c in colLabels :
                                            firstLabel = "%s%s%s"%(qlabel,rowLabels[0],c)
                                            lastLabel = "%s%s%s"%(qlabel,rowLabels[-1],c)
                                            toCode = '%s THRU %s'%(min(rowValues),max(rowValues)) if rowValues else '1'
                                            toText = '%s TO %s (%s)'%(firstLabel,lastLabel,toCode)

                                            if noanswerSyntax :
                                                toText = '%s / (%s)'%(toText,' AND '.join(noanswerSyntax))

                                            syntax += mafreq%(toText)
                                else :
                                    for r in rowLabels :
                                        firstLabel = "%s%s%s"%(qlabel,r,colLabels[0])
                                        lastLabel = "%s%s%s"%(qlabel,r,colLabels[-1])
                                        toCode = '%s THRU %s'%(min(colValues),max(colValues)) if colValues else '1'
                                        toText = '%s TO %s (%s)'%(firstLabel,lastLabel,toCode)

                                        if noanswerSyntax :
                                            toText = '%s / (%s)'%(toText,' AND '.join(noanswerSyntax))

                                        syntax += mafreq%(toText)

                            #only row
                            elif rowLabels and not colLabels :
                                firstLabel = "%s%s"%(qlabel,rowLabels[0])
                                lastLabel = "%s%s"%(qlabel,rowLabels[-1])
                                toCode = '%s THRU %s'%(min(rowValues),max(rowValues)) if rowValues else '1'
                                toText = '%s TO %s (%s)'%(firstLabel,lastLabel,toCode)

                                if noanswerSyntax :
                                    toText = '%s / (%s)'%(toText,' AND '.join(noanswerSyntax))

                                syntax += mafreq%(toText)

                            #only col
                            elif not rowLabels and colLabels :
                                firstLabel = "%s%s"%(qlabel,colLabels[0])
                                lastLabel = "%s%s"%(qlabel,colLabels[-1])
                                toCode = '%s THRU %s'%(min(colValues),max(colValues)) if colValues else '1'
                                toText = '%s TO %s (%s)'%(firstLabel,lastLabel,toCode)

                                if noanswerSyntax :
                                    toText = '%s / (%s)'%(toText,' AND '.join(noanswerSyntax))

                                syntax += mafreq%(toText)

                        #number or float
                        if stype in ['number','float']:
                            rangeSyntax = ''
                            amountchk = ''
                            if 'verify' in options :
                                #range(,)
                                if 'range' in options['verify'] : 
                                    verify = options['verify']
                                    rangeText = verify[verify.find('(')+1:verify.find(')')]
                                    rangeText = rangeText.split(',')
                                    minv = eval(rangeText[0])
                                    maxv = eval(rangeText[1])
                                    rangeSyntax = '(%s THRU %s)'%(minv,maxv)

                            #float range
                            if stype == 'float' :
                                if 'range=' in options :
                                    verify = options['range']
                                    rangeText = verify.split(',')
                                    minv = eval(rangeText[0])
                                    maxv = eval(rangeText[1])
                                    rangeSyntax = '(%s THRU %s)'%(minv,maxv)


                            if 'amount' in options :
                                amountchk = options['amount']

                            defalutRange = rangeSyntax
                            defalutAmount = amountchk

                            #row and col
                            if rowLabels and colLabels :
                                if 'grouping' in options and options['grouping'] == 'cols':
                                    for c in colLabels :
                                        rangeSyntax = defalutRange
                                        amountchk = defalutAmount
                                                
                                        for r in rowLabels :
                                            nLabel = '%s%s%s%s'%(qlabel,r,c,rangeSyntax)

                                            if noanswerSyntax :
                                                nLabel = '%s / (%s)'%(nLabel,' AND '.join(noanswerSyntax))

                                            syntax += safreq%(nLabel)

                                        if not amountchk == '' :
                                            baseid = '%s%s'%(qlabel,c)
                                            firstvar = '%s%s%s'%(qlabel,c,rowLabels[0])
                                            lastvar = '%s%s%s'%(qlabel,c,rowLabels[-1])
                                            sumsyntax = sumSyntax(baseid,firstvar,lastvar)
                                            syntax+=sumsyntax['syntax']
                                            syntax+='EXECUTE.\n'
                                            sumchk = '%s(%s)'%(sumsyntax['sumID'],amountchk)
                                            syntax+=safreq%(sumchk)
                                            syntax+='\n'

                                else :
                                    for r in rowLabels :
                                        rangeSyntax = defalutRange
                                        amountchk = defalutAmount

                                        for c in colLabels :
                                            nLabel = '%s%s%s%s'%(qlabel,r,c,rangeSyntax)

                                            if noanswerSyntax :
                                                nLabel = '%s / (%s)'%(nLabel,' AND '.join(noanswerSyntax))

                                            syntax += safreq%(nLabel)

                                        if not amountchk == '' :
                                            baseid = '%s%s'%(qlabel,r)
                                            firstvar = '%s%s%s'%(qlabel,r,colLabels[0])
                                            lastvar = '%s%s%s'%(qlabel,r,colLabels[-1])
                                            sumsyntax = sumSyntax(baseid,firstvar,lastvar)
                                            syntax+=sumsyntax['syntax']
                                            syntax+='EXECUTE.\n'
                                            sumchk = '%s(%s)'%(sumsyntax['sumID'],amountchk)
                                            syntax+=safreq%(sumchk)
                                            syntax+='\n'
                            #row number
                            elif rowLabels and not colLabels :
                                for r in rowLabels :
                                    rqid = '%s%s'%(qlabel,r)
                                    rangeSyntax = defalutRange
                                    amountchk = defalutAmount


                                    nLabel = "%s%s"%(rqid,rangeSyntax)

                                    if noanswerSyntax :
                                        nLabel = '%s / (%s)'%(nLabel,' AND '.join(noanswerSyntax))

                                        syntax += safreq%(nLabel)
                                    else :
                                        syntax += safreq%(nLabel)

                                if not amountchk == '' :
                                    baseid = '%s'%(qlabel)
                                    firstvar = '%s%s'%(qlabel,rowLabels[0])
                                    lastvar = '%s%s'%(qlabel,rowLabels[-1])
                                    sumsyntax = sumSyntax(baseid,firstvar,lastvar)
                                    syntax+=sumsyntax['syntax']
                                    syntax+='EXECUTE.\n'
                                    sumchk = '%s(%s)'%(sumsyntax['sumID'],amountchk)
                                    syntax+=safreq%(sumchk)
                                    syntax+='\n'


                            #col number
                            elif not rowLabels and colLabels :
                                for c in colLabels :
                                    rqid = '%s%s'%(qlabel,c)
                                    rangeSyntax = defalutRange
                                    amountchk = defalutAmount


                                    nLabel = "%s%s"%(rqid,rangeSyntax)

                                    if noanswerSyntax :
                                        nLabel = '%s / (%s)'%(nLabel,' AND '.join(noanswerSyntax))

                                        syntax += safreq%(nLabel)
                                    else :
                                        syntax += safreq%(nLabel)

                                if not amountchk == '' :
                                    baseid = '%s'%(qlabel)
                                    firstvar = '%s%s'%(qlabel,colLabels[0])
                                    lastvar = '%s%s'%(qlabel,colLabels[-1])
                                    sumsyntax = sumSyntax(baseid,firstvar,lastvar)
                                    syntax+=sumsyntax['syntax']
                                    syntax+='EXECUTE.\n'
                                    sumchk = '%s(%s)'%(sumsyntax['sumID'],amountchk)
                                    syntax+=safreq%(sumchk)
                                    syntax+='\n'

                            #defalut number
                            else :
                                nLabel = "%s%s"%(qlabel,rangeSyntax)

                                if noanswerSyntax :
                                    nLabel = '%s / (%s)'%(nLabel,' AND '.join(noanswerSyntax))

                                syntax += safreq%(nLabel)

                        #select
                        if stype == 'select' :
                            #ranksort (only rows)
                            if 'uses' in options and 'ranksort' in options['uses'] :
                                minv = 1
                                maxv = len(choiceLabels)
                                
                                if choiceValues :
                                    minv = min(choiceValues)
                                    maxv = max(choiceValues)

                                firstLabel = "%s%s"%(qlabel,rowLabels[0])
                                lastLabel = "%s%s"%(qlabel,rowLabels[-1])
                                toCode = '%s THRU %s'%(minv,maxv)
                                toText = '%s TO %s (%s)'%(firstLabel,lastLabel,toCode)

                                syntax += mafreq%(toText)

                            elif rowLabels and colLabels :
                                if 'grouping' in options and options['grouping'] == 'cols':
                                    for c in colLabels :
                                        for r in rowLabels :
                                            saLabel = '%s%s%s'%(qlabel,r,c)

                                            if noanswerSyntax :
                                                saLabel = '%s / (%s)'%(saLabel,' AND '.join(noanswerSyntax))

                                            syntax += safreq%(saLabel)
                                else :
                                    for r in rowLabels :
                                        for c in colLabels :
                                            saLabel = '%s%s%s'%(qlabel,r,c)

                                            if noanswerSyntax :
                                                saLabel = '%s / (%s)'%(saLabel,' AND '.join(noanswerSyntax))
                                                
                                            syntax += safreq%(saLabel)

                            #row select
                            elif rowLabels and not colLabels :
                                for r in rowLabels :
                                    saLabel = '%s%s'%(qlabel,r)

                                    if noanswerSyntax :
                                        saLabel = '%s / (%s)'%(saLabel,' AND '.join(noanswerSyntax))
                                        
                                    syntax += safreq%(saLabel)

                            #col select
                            elif not rowLabels and colLabels :
                                for c in colLabels :
                                    saLabel = '%s%s'%(qlabel,c)

                                    if noanswerSyntax :
                                        saLabel = '%s / (%s)'%(saLabel,' AND '.join(noanswerSyntax))
                                        
                                    syntax += safreq%(saLabel)

                            #defalut select
                            else :
                                saLabel = qlabel

                                if noanswerSyntax :
                                    saLabel = '%s / (%s)'%(saLabel,' AND '.join(noanswerSyntax))

                                syntax += safreq%(saLabel)

                            if 'unique' in options :
                                selectOption = options['unique'].split(',')
                                if 'none' in selectOption :
                                    selectOption.remove('none')

                                for o in selectOption :
                                    syntax += selectUnique(qlabel,rowLabels,colLabels,o)
                                if len(selectOption) >=2 :
                                    syntax += '*(Select duplicate : 2 option in unique) Please fix it and use it.\n'

                        #text or textarea
                        if stype in ['text','textarea']:
                            textList = []

                            if 'uses' in options and 'videoplayer' in options['uses'] :
                                syntax += '*%s is videoplayer.\n'%(qlabel)
                            else :
                                if stype in ['text','textarea'] :
                                    syntax += '*%s is OE.\n%s'%(qlabel,temps)
                                elif stype in ['image'] :
                                    syntax += '*%s is image uploader.\n%s'%(qlabel,temps)

                                if rowLabels and colLabels :
                                    if 'grouping' in options and options['grouping'] == 'cols':
                                        for c in colLabels :
                                            textList = []
                                            for r in rowLabels :
                                                setLabel = '%s%s%s'%(qlabel,r,c)
                                                textList.append(setLabel)

                                            txLabel = '%s TO %s'%(textList[0],textList[-1]) if len(textList) >=2 else textList[0]

                                            if noanswerSyntax :
                                                syntax += 'SEL IF (%s).\n'%(' AND '.join(noanswerSyntax))

                                            syntax += textchk%(txLabel)
                                    else :
                                        for r in rowLabels :
                                            textList = []
                                            for c in colLabels :
                                                setLabel = '%s%s%s'%(qlabel,r,c)
                                                textList.append(setLabel)

                                            txLabel = '%s TO %s'%(textList[0],textList[-1]) if len(textList) >=2 else textList[0]

                                            if noanswerSyntax :
                                                syntax += 'SEL IF (%s).\n'%(' AND '.join(noanswerSyntax))

                                            syntax += textchk%(txLabel)

                                #row text
                                elif rowLabels and not colLabels :
                                    textList = []
                                    for r in rowLabels :
                                        setLabel = '%s%s'%(qlabel,r)
                                        textList.append(setLabel)

                                    txLabel = '%s TO %s'%(textList[0],textList[-1]) if len(textList) >=2 else textList[0]

                                    if noanswerSyntax :
                                        syntax += 'SEL IF (%s).\n'%(' AND '.join(noanswerSyntax))

                                    syntax += textchk%(txLabel)

                                #col text
                                elif not rowLabels and colLabels :
                                    textList = []
                                    for c in colLabels :
                                        setLabel = '%s%s'%(qlabel,c)
                                        textList.append(setLabel)

                                    txLabel = '%s TO %s'%(textList[0],textList[-1]) if len(textList) >=2 else textList[0]

                                    if noanswerSyntax :
                                        syntax += 'SEL IF (%s).\n'%(' AND '.join(noanswerSyntax))

                                    syntax += textchk%(txLabel)

                                #defalut text
                                else :
                                    txLabel = qlabel

                                    if noanswerSyntax :
                                        syntax += 'SEL IF (%s).\n'%(' AND '.join(noanswerSyntax))

                                    syntax += textchk%(txLabel)

            #print syntax
            #print(syntax)
            self.view.replace(edit,sel, syntax)

        except Exception as e:
            print (e)



class makeQuotaCommand(sublime_plugin.TextCommand) :
    def run (self,edit):
        try:
            sels = self.view.sel()
            
            for sel in sels :
                s = self.view.substr(sel)
                s = s.split('\n')
                s = [i for i in s if not i.strip()=='']

                td = dict()

                for t in s :
                    st = t.split('\t')

                    for ix, v in enumerate(st) :
                        if not ix in td :
                            td[ix] = []

                        if not v.strip() == '' :
                            td[ix].append(v)

                sorttd = [arr for ix,arr in sorted(td.items()) ]
                sorttd = list(product(*sorttd))

                printPage = ''

                for ix, tx in enumerate(sorttd) :
                    arr = tx
                    if not ix == 0 :
                        arr = []
                        beforeArr = sorttd[ix-1]
                        for t in tx :
                            if t in beforeArr :
                                arr.append('')
                            else :
                                arr.append(t)

                    printPage += '%s\tinf\n'%('\t'.join(arr))
                    

                #print(printPage)
                
                self.view.replace(edit,sel, printPage)

        except Exception as e:
            print (e)


class makeDcmResCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)

                line_split = input.split("\n")
                line_split = [line for line in line_split if not line.strip() == ""]

                legend_cnt = 0
                legends = []
                levels = []

                for line in line_split :
                    sline = line.replace('\t',' ')
                    sline = sline.split(' ')
                    
                    if not sline[0].isdigit() :
                        # legend
                        legend_cnt += 1
                        legends.append((legend_cnt, line))
                        continue

                    if sline[0].isdigit() :
                        curr = (legend_cnt, int(sline[0]), ' '.join(sline[1:]).strip())
                        levels.append(curr)

                printPage += '<res label="NoneText">None</res>\n'
                printPage += '<res label="TopText">Concept</res>\n'
                printPage += '<res label="rowText">Select</res>\n'
                
                for legend in legends :
                    legend_code = legend[0]
                    legend_text = legend[1].replace("&", "&amp;")
                    printPage += '<res label="DCM_legend%s">%s</res>\n'%(legend_code, legend_text)

                    curr_levels = [level for level in levels if level[0]==legend_code]

                    for level in curr_levels :
                        level_code = level[1]
                        level_text = level[2].replace("&", "&amp;")
                        printPage += '<res label="DCM_att%s_level%s">%s</res>\n'%(legend_code, level_code, level_text)
    
                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)

class makeMaxdiffResCommand(sublime_plugin.TextCommand):
    def run (self,edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            
            for sel in sels:
                printPage = ''
                input = self.view.substr(sel)

                line_split = input.split("\n")
                line_split = [line.replace('\t',' ').replace("&", "&amp;").split(' ') for line in line_split if not line.strip() == ""]

                for line in line_split :
                    attr_code = line[0]
                    attr_text = ' '.join(line[1:])
                    printPage += '<res label="MD_item%s">%s</res>\n'%(attr_code, attr_text)
                
                self.view.replace(edit,sel, printPage)
        except Exception as e:
            print (e)


class loopLabelCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                set_text = ''
                if textr == '' :
                    set_text = '_[loopvar: label]'
                else :
                    textr = self.view.substr(sels)
                    set_text = '[loopvar: %s]'%(textr)
                self.view.replace(edit,sels, set_text)
                
            except Exception as e:
                print (e) 


class entityCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                textr = html.escape(textr)
                textr = textr.replace('[', '〔')
                textr = textr.replace(']', '〕')
                self.view.replace(edit,sels, textr)
                
            except Exception as e:
                print (e) 


class splitContextCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                textr = textr.replace('?', '?<br/>')
                self.view.replace(edit,sels, textr)
                
            except Exception as e:
                print (e) 



class splitCommentCommand(sublime_plugin.TextCommand):
        def run (self, edit):
            try:
                sels = self.view.sel()[0]
                textr = self.view.substr(sels)
                textr = textr.replace('?', '?\n')
                textr = textr.split('\n')

                textr = '\n'.join(["<p>%s</p>"%(x.strip()) for x in textr if len(x.strip()) != 0])
                
                self.view.replace(edit,sels, textr)
                
            except Exception as e:
                print (e) 



class makeColAutoValueCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            for sel in sels:
                count = 0
                printPage = ''
                extra = ''
                input = self.view.substr(sel)
                #CLEAN UP THE TABS
                input = re.sub("\t+", " ", input)

                #CLEAN UP SPACES
                input = re.sub("\n +\n", "\n\n", input)

                #CLEAN UP THE EXTRA LINE BREAKS
                input = re.sub("\n{2,}", "\n", input)
                input = fixUniCode(input)

                input = input.strip().split("\n")
                #ebay has a different openSize
                openSize =  '45' if docType =='EBA' else '25'

                for x in range(0,len(input)):
                    input[x] = re.sub("^[a-zA-Z0-9]{1,2}[\.:\)][ \t]+", "", input[x])

                for x in input:

                    if ("other" in input[count].strip().lower() and "specify" in input[count].strip().lower()) or ("기타" in input[count].strip().lower() and "구체적" in input[count].strip().lower()):
                      input[count] = input[count].strip().replace("_", "")
                      extra=' open=\"1\" openSize=\"'+openSize+'\" randomize=\"0\"'
                    else:
                      extra = ''
                    printPage += "  <col label=\"c%s\"%s value=\"%s\">%s</col>\n" % (str(count+1), extra, str(count+1), input[count].strip())
                    count += 1
                # thanks to replace the regions keep updated with their start and end point
                self.view.replace(edit,sel, checkDupeElement(printPage))

        except Exception as e:
            print (e)


class makeChoiceAutoValueCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        try:
            sels = self.view.sel()
            input = ''
            docType =  returnContext(self)
            for sel in sels:
                count = 0
                printPage = ''
                extra = ''
                input = self.view.substr(sel)
                #CLEAN UP THE TABS
                input = re.sub("\t+", " ", input)

                #CLEAN UP SPACES
                input = re.sub("\n +\n", "\n\n", input)

                #CLEAN UP THE EXTRA LINE BREAKS
                input = re.sub("\n{2,}", "\n", input)
                input = fixUniCode(input)

                input = input.strip().split("\n")
                #ebay has a different openSize
                openSize =  '45' if docType =='EBA' else '25'

                for x in range(0,len(input)):
                    input[x] = re.sub("^[a-zA-Z0-9]{1,2}[\.:\)][ \t]+", "", input[x])

                for x in input:
                    extra = ''
                    printPage += "  <choice label=\"ch%s\"%s value=\"%s\">%s</choice>\n" % (str(count+1), extra, str(count+1), input[count].strip())
                    count += 1
                # thanks to replace the regions keep updated with their start and end point
                self.view.replace(edit,sel, checkDupeElement(printPage))

        except Exception as e:
            print (e)