import { LawChapter } from "./types";
import { QuestionData } from "./types";
export const MOCK_LAWS: LawChapter[] = [
  {
    id: "000",
    title: "000 表紙 (略語)",
    content: "司法試験用法文... (略)",
  },
  {
    id: "018",
    title: "民法 (明治二十九年法律第八十九号)",
    content: `
      <h3 style="font-weight:bold; margin-bottom:8px;">第一編 総則</h3>
      <h4 style="font-weight:bold; margin-bottom:4px;">第一章 通則</h4>
      <p style="margin-bottom:8px;"><span style="font-weight:bold;">第一条</span> 私権は、公共の福祉に適合しなければならない。</p>
      <p style="margin-bottom:8px;"><span style="font-weight:bold;">２</span> 権利の行使及び義務の履行は、信義に従い誠実に行わなければならない。</p>
      <p style="margin-bottom:16px;"><span style="font-weight:bold;">３</span> 権利の濫用は、これを許さない。</p>
      
      <h4 style="font-weight:bold; margin-bottom:4px;">第二章 人</h4>
      <h5 style="font-weight:bold; margin-bottom:4px;">第一節 権利能力</h5>
      <p style="margin-bottom:8px;"><span style="font-weight:bold;">第三条</span> 私権の享有は、出生に始まる。</p>
      <p style="margin-bottom:8px;"><span style="font-weight:bold;">２</span> 外国人は、法令又は条約の規定により禁止される場合を除き、私権を享有する。</p>
    `,
  },
  {
    id: "019",
    title: "民法施行法",
    content: "民法施行法の内容...",
  },
  {
    id: "022",
    title: "借地借家法",
    content: "借地借家法の内容...",
  },
  // --- 以下を追加: 刑事訴訟法 ---
  {
    id: "131",
    title: "刑事訴訟法 (昭和二十三年法律第百三十一号)",
    content: `
      <h3 style="font-weight:bold; margin-top:16px; margin-bottom:8px;">第一編 総則</h3>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第一条</span>　この法律は、刑事事件につき、公共の福祉の維持と個人の基本的人権の保障とを全うしつつ、事案の真相を明らかにし、刑罰法令を適正且つ迅速に適用実現することを目的とする。
      </p>

      <h4 style="font-weight:bold; margin-top:12px; margin-bottom:4px;">第一章　裁判所の管轄</h4>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第二条</span>　裁判所の土地管轄は、犯罪地又は被告人の住所、居所若しくは現在地による。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　国外に在る日本船舶内で犯した罪については、前項に規定する地の外、その船舶の船籍の所在地又は犯罪後その船舶の寄泊した地による。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">③</span>　国外に在る日本航空機内で犯した罪については、第一項に規定する地の外、犯罪後その航空機の着陸（着水を含む。）した地による。
      </p>

      <h4 style="font-weight:bold; margin-top:12px; margin-bottom:4px;">第二章　裁判所職員の除斥及び忌避</h4>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第二十条</span>　裁判官は、次に掲げる場合には、職務の執行から除斥される。
      </p>
      <div style="margin-left: 2em; margin-bottom:8px;">
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">一</span>　裁判官が被害者であるとき。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">二</span>　裁判官が被告人又は被害者の親族であるとき、又はあつたとき。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">三</span>　裁判官が被告人又は被害者の法定代理人、後見監督人、保佐人、保佐監督人、補助人又は補助監督人であるとき。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">四</span>　裁判官が事件について証人又は鑑定人となつたとき。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">五</span>　裁判官が事件について被告人の代理人、弁護人又は補佐人となつたとき。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">六</span>　裁判官が事件について検察官又は司法警察員の職務を行つたとき。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">七</span>　裁判官が事件について第二百六十六条第二号の決定、略式命令、前審の裁判、第三百九十八条乃至第四百条、第四百十二条若しくは第四百十三条の規定により差し戻し、若しくは移送された場合における原判決又はこれらの裁判の基礎となつた取調べに関与したとき。ただし、受託裁判官として関与した場合は、この限りでない。</p>
      </div>

      <h3 style="font-weight:bold; margin-top:16px; margin-bottom:8px;">第二編　第一審</h3>
      <h4 style="font-weight:bold; margin-top:12px; margin-bottom:4px;">第一章　捜査</h4>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第百八十九条</span>　警察官は、それぞれ、他の法律又は国家公安委員会若しくは都道府県公安委員会の定めるところにより、司法警察職員として職務を行う。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　司法警察職員は、犯罪があると思料するときは、犯人及び証拠を捜査するものとする。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第百九十九条</span>　検察官、検察事務官又は司法警察職員は、被疑者が罪を犯したことを疑うに足りる相当な理由があるときは、裁判官のあらかじめ発する逮捕状により、これを逮捕することができる。ただし、三十万円（刑法、暴力行為等処罰に関する法律及び経済関係罰則の整備に関する法律の罪以外の罪については、当分の間、二万円）以下の罰金、拘留又は科料に当たる罪については、被疑者が定まつた住居を有しない場合又は正当な理由がなく前条の規定による出頭の求めに応じない場合に限る。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　裁判官は、被疑者が罪を犯したことを疑うに足りる相当な理由があると認めるときは、検察官又は司法警察員（警察官たる司法警察員については、国家公安委員会又は都道府県公安委員会が指定する警部以上の者に限る。次項及び第二百一条の二第一項において同じ。）の請求により、前項の逮捕状を発する。ただし、明らかに逮捕の必要がないと認めるときは、この限りでない。
      </p>

      <h4 style="font-weight:bold; margin-top:12px; margin-bottom:4px;">第三章　公判</h4>
      
      <!-- 追加部分: 第二節 争点及び証拠の整理手続 -->
      <h5 style="font-weight:bold; margin-top:12px; margin-bottom:4px;">第二節　争点及び証拠の整理手続</h5>
      <p style="font-weight:bold; margin-bottom:4px; margin-left:0.5em;">第一款　公判前整理手続</p>
      <p style="font-weight:bold; margin-bottom:4px; margin-left:1em;">第一目　通則</p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の二</span>　裁判所は、充実した公判の審理を継続的、計画的かつ迅速に行うため必要があると認めるときは、検察官、被告人若しくは弁護人の請求により又は職権で、第一回公判期日前に、決定で、事件の争点及び証拠を整理するための公判準備として、事件を公判前整理手続に付することができる。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　前項の決定又は同項の請求を却下する決定をするには、裁判所の規則の定めるところにより、あらかじめ、検察官及び被告人又は弁護人の意見を聴かなければならない。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">③</span>　公判前整理手続は、この款に定めるところにより、訴訟関係人を出頭させて陳述させ、又は訴訟関係人に書面を提出させる方法により、行うものとする。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の三</span>　裁判所は、充実した公判の審理を継続的、計画的かつ迅速に行うことができるよう、公判前整理手続において、十分な準備が行われるようにするとともに、できる限り早期にこれを終結させるように努めなければならない。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　訴訟関係人は、充実した公判の審理を継続的、計画的かつ迅速に行うことができるよう、公判前整理手続において、相互に協力するとともに、その実施に関し、裁判所に進んで協力しなければならない。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の四</span>　公判前整理手続においては、被告人に弁護人がなければその手続を行うことができない。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　公判前整理手続において被告人に弁護人がないときは、裁判長は、職権で弁護人を付さなければならない。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の五</span>　公判前整理手続においては、次に掲げる事項を行うことができる。
      </p>
      <div style="margin-left: 2em; margin-bottom:8px;">
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">一</span>　訴因又は罰条を明確にさせること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">二</span>　訴因又は罰条の追加、撤回又は変更を許すこと。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">三</span>　第二百七十一条の五第一項又は第二項（これらの規定を第三百十二条の二第四項において準用する場合を含む。）の請求について決定をすること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">四</span>　公判期日においてすることを予定している主張を明らかにさせて事件の争点を整理すること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">五</span>　証拠調べの請求をさせること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">六</span>　前号の請求に係る証拠について、その立証趣旨、尋問事項等を明らかにさせること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">七</span>　証拠調べの請求に関する意見（証拠書類について第三百二十六条の同意をするかどうかの意見を含む。）を確かめること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">八</span>　証拠調べをする決定又は証拠調べの請求を却下する決定をすること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">九</span>　証拠調べをする決定をした証拠について、その取調べの順序及び方法を定めること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">十</span>　証拠調べに関する異議の申立てに対して決定をすること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">十一</span>　第三目の定めるところにより証拠開示に関する裁定をすること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">十二</span>　第三百十六条の三十三第一項の規定による被告事件の手続への参加の申出に対する決定又は当該決定を取り消す決定をすること。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">十三</span>　公判期日を定め、又は変更することその他公判手続の進行上必要な事項を定めること。</p>
      </div>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の六</span>　裁判長は、訴訟関係人を出頭させて公判前整理手続をするときは、公判前整理手続期日を定めなければならない。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　公判前整理手続期日は、これを検察官、被告人及び弁護人に通知しなければならない。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">③</span>　裁判長は、検察官、被告人若しくは弁護人の請求により又は職権で、公判前整理手続期日を変更することができる。この場合においては、裁判所の規則の定めるところにより、あらかじめ、検察官及び被告人又は弁護人の意見を聴かなければならない。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の七</span>　公判前整理手続期日に検察官又は弁護人が出頭しないときは、その期日の手続を行うことができない。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の八</span>　弁護人が公判前整理手続期日に出頭しないとき、又は在席しなくなつたときは、裁判長は、職権で弁護人を付さなければならない。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　弁護人が公判前整理手続期日に出頭しないおそれがあるときは、裁判所は、職権で弁護人を付することができる。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の九</span>　被告人は、公判前整理手続期日に出頭することができる。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　裁判所は、必要と認めるときは、被告人に対し、公判前整理手続期日に出頭することを求めることができる。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">③</span>　裁判長は、被告人を出頭させて公判前整理手続をする場合には、被告人が出頭する最初の公判前整理手続期日において、まず、被告人に対し、終始沈黙し、又は個々の質問に対し陳述を拒むことができる旨を告知しなければならない。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の十</span>　裁判所は、弁護人の陳述又は弁護人が提出する書面について被告人の意思を確かめる必要があると認めるときは、公判前整理手続期日において被告人に対し質問を発し、及び弁護人に対し被告人と連署した書面の提出を求めることができる。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の十一</span>　裁判所は、合議体の構成員に命じ、公判前整理手続（第三百十六条の五第二号、第三号、第八号及び第十号から第十二号までの決定を除く。）をさせることができる。この場合において、受命裁判官は、裁判所又は裁判長と同一の権限を有する。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十六条の十二</span>　公判前整理手続期日には、裁判所書記官を立ち会わせなければならない。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　公判前整理手続期日における手続については、裁判所の規則の定めるところにより、公判前整理手続調書を作成しなければならない。
      </p>

      <h5 style="font-weight:bold; margin-top:12px; margin-bottom:4px;">第四節　証拠</h5>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十七条</span>　事実の認定は、証拠による。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十八条</span>　証拠の証明力は、裁判官の自由な判断に委ねる。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百十九条</span>　強制、拷問又は脅迫による自白、不当に長く抑留又は拘禁された後の自白その他任意にされたものでない疑のある自白は、これを証拠とすることができない。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">②</span>　被告人は、公判廷における自白であると否とを問わず、その自白が自己に不利益な唯一の証拠である場合には、有罪とされない。
      </p>
      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">③</span>　前二項の自白には、起訴された犯罪について有罪であることを自認する場合を含む。
      </p>

      <p style="margin-bottom:8px; margin-left:1em; text-indent:-1em;">
        <span style="font-weight: bold;">第三百二十一条</span>　被告人以外の者が作成した供述書又はその者の供述を録取した書面で供述者の署名若しくは押印のあるものは、次に掲げる場合に限り、これを証拠とすることができる。
      </p>
      <div style="margin-left: 2em; margin-bottom:8px;">
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">一</span>　裁判官の面前（映像と音声の送受信により相手の状態を相互に認識しながら通話をすることができる方法による場合を含む。次号において同じ。）における供述を録取した書面については、その供述者が死亡、精神若しくは身体の故障、所在不明若しくは国外にいるため公判準備若しくは公判期日において供述することができないとき、又は供述者が公判準備若しくは公判期日において前の供述と異なつた供述をしたとき。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">二</span>　検察官の面前における供述を録取した書面については、その供述者が死亡、精神若しくは身体の故障、所在不明若しくは国外にいるため公判準備若しくは公判期日において供述することができないとき、又は公判準備若しくは公判期日において前の供述と相反するか若しくは実質的に異なつた供述をしたとき。ただし、公判準備又は公判期日における供述よりも前の供述を信用すべき特別の情況の存するときに限る。</p>
        <p style="margin-bottom:4px; margin-left:1em; text-indent:-1em;"><span style="font-weight: bold;">三</span>　前二号に掲げる書面以外の書面については、供述者が死亡、精神若しくは身体の故障、所在不明又は国外にいるため公判準備又は公判期日において供述することができず、かつ、その供述が犯罪事実の存否の証明に欠くことができないものであるとき。ただし、その供述が特に信用すべき情況の下にされたものであるときに限る。</p>
      </div>
    `,
  },
];




export const MOCK_QUESTIONS: QuestionData[] = [
  {
    id: "q1",
    title: "第１問",
    content: `
      <h3 style="font-size:1.125rem; font-weight:bold; margin-bottom:16px;">【第１問】（配点：１００）</h3>
      <p style="margin-bottom:16px; line-height:1.625;">
        議会制民主主義においては、主権者である国民の意思を議会へ反映させる上で、議会の構成員となる議員を選出する選挙が重要な役割を果たしている。そこで、有権者が選挙に積極的に参加すること、また、候補者が自らの主張や公約等を有権者に対して十分に伝えられることが求められる。
      </p>
      <p style="margin-bottom:16px; line-height:1.625;">
        ２０＊＊年以降、我が国では投票率が低下し続け、研究者による有権者の動向調査では、近い将来、国政選挙の投票率が３０パーセントを下回ると予想されている。このままでは、多数の有権者からの支持を受けていないという意味において、十分な民主的等当性を備えていない国会議員が恒常的に出現することとなる。これを受けて、人々等間では、結果的に議会制民主主義の危機ともいえる事態を招くのではないかとの懸念が共有されるようになった。そこで、この事態を回避するための積極的な施策の導入が検討され始めている。
      </p>
      <p style="margin-bottom:16px; line-height:1.625;">
        また、候補者や政党が自らの主張や公約等を伝えるための選挙運動の一つとして、公職選挙法に定める街頭演説がある。街頭演説とは、例えば、候補者らが、のぼりを立てて街頭の一定の場所にとどまって演説したり、選挙運動用自動車等の上やその周囲で演説したりするものを指す。
      </p>
      <div style="padding:16px; border:1px solid #d1d5db; background-color:#f9fafb; border-radius:4px; margin-bottom:16px;">
        <p style="font-weight:bold;">設問1</p>
        <p>国政選挙における強制投票制度の導入について、憲法上の問題点を論じなさい。</p>
      </div>
       <div style="padding:16px; border:1px solid #d1d5db; background-color:#f9fafb; border-radius:4px; margin-bottom:16px;">
        <p style="font-weight:bold;">設問2</p>
        <p>街頭演説における聴衆による不穏当な行為の禁止について、Xは本法律案の合憲性について法律学的に相談した。その際の甲とXとのやり取りは以下のとおりであった...</p>
      </div>
    `,
  },
];


// import { AccordionItem } from "../app/type/type";

export type ButtonItem = {
  name: string;
  link: string;
  image: string;
  click: string;
};

export type AccordionItem = {
  summary: string;
  buttons: ButtonItem[];
};

export const accordionItems: AccordionItem[] = [
  // 1. 公法系科目（憲法＋行政法）
  {
    summary: "公法系科目",
    buttons: [
      // --- 憲法 ---
      {
        name: "憲法",
        link: "/321CONSTITUTION",
        image: "/law.jpg",
        click: "topToKenpou",
      },
      {
        name: "国会法",
        link: "/322AC1000000079",
        image: "/law.jpg",
        click: "topToKokkai",
      },
      // --- 行政法 ---
      {
        name: "行政事件訴訟法",
        link: "/337AC0000000139",
        image: "/law.jpg",
        click: "topToGyouso",
      },
      {
        name: "行政手続法",
        link: "/405AC0000000088",
        image: "/law.jpg",
        click: "topToGyoute",
      },
      {
        name: "行政不服審査法",
        link: "/426AC0000000068",
        image: "/law.jpg",
        click: "topToGyoufuku",
      },
      {
        name: "国家賠償法",
        link: "/322AC0000000125_20150801_000000000000000",
        image: "/law.jpg",
        click: "topToKokubai",
      },
      {
        name: "行政代執行法",
        link: "/323AC0000000043",
        image: "/law.jpg",
        click: "topToDaishikkou",
      },
      {
        name: "地方自治法",
        link: "/322AC0000000067",
        image: "/law.jpg",
        click: "topToChihoujichi",
      },
    ],
  },

  // 2. 民事系科目（民法＋商法＋民事訴訟法）
  {
    summary: "民事系科目",
    buttons: [
      // --- 民法 ---
      {
        name: "民法",
        link: "/129AC0000000089",
        image: "/law.jpg",
        click: "topToMinpou",
      },
      {
        name: "借地借家法",
        link: "/403AC0000000090",
        image: "/law.jpg",
        click: "topToSyakuchi",
      },
      // --- 商法・会社法 ---
      {
        name: "会社法",
        link: "/417AC0000000086",
        image: "/law.jpg",
        click: "topToKaisyahou",
      },
      {
        name: "会社法施行規則",
        link: "/418M60000010012",
        image: "/law.jpg",
        click: "topToKaisyahouKisoku",
      },
      {
        name: "商法",
        link: "/132AC0000000048_20200401_429AC0000000045",
        image: "/law.jpg",
        click: "topToSyouhou",
      },
      {
        name: "手形法",
        link: "/307AC0000000020",
        image: "/law.jpg",
        click: "topToTegata",
      },
      {
        name: "小切手法",
        link: "/308AC0000000057_20200401_429AC0000000045",
        image: "/law.jpg",
        click: "topToKogitte",
      },
      // --- 民事訴訟法 ---
      {
        name: "民事訴訟法",
        link: "/408AC0000000109",
        image: "/law.jpg",
        click: "topToMinso",
      },
      {
        name: "民事訴訟規則",
        link: "/h08Zj000050301ja14.0_h20R10",
        image: "/law.jpg",
        click: "topToMinjikisoku",
      },
      {
        name: "民事保全法",
        link: "/401AC0000000091_20230614_505AC0000000053",
        image: "/law.jpg",
        click: "topToMinjihozen",
      },
      {
        name: "民事執行法",
        link: "/354AC0000000004",
        image: "/law.jpg",
        click: "topToMinjishikkou",
      },
    ],
  },

  // 3. 刑事系科目（刑法＋刑事訴訟法）
  {
    summary: "刑事系科目",
    buttons: [
      // --- 刑法 ---
      {
        name: "刑法",
        link: "/140AC0000000045",
        image: "/law.jpg",
        click: "topToKeihou",
      },
      // --- 刑事訴訟法 ---
      {
        name: "刑事訴訟法",
        link: "/323AC0000000131",
        image: "/law.jpg",
        click: "topToKeiso",
      },
      {
        name: "刑事訴訟規則",
        link: "/s23Zj000320201ja14.0_h20R17",
        image: "/law.jpg",
        click: "topToKeisokisoku",
      },
    ],
  },

  // 4. その他（選択科目等）
  // ※「選択科目」としてまとめることも可能ですが、ここでは元の区分のまま記載します
  {
    summary: "労働法",
    buttons: [
      {
        name: "労働基準法",
        link: "/322AC0000000049",
        image: "/law.jpg",
        click: "topToRoukihou",
      },
      {
        name: "労働組合法",
        link: "/324AC0000000174",
        image: "/law.jpg",
        click: "topToRousohou",
      },
      {
        name: "労働契約法",
        link: "/419AC0000000128",
        image: "/law.jpg",
        click: "topToRoukeihou",
      },
    ],
  },
  {
    summary: "租税法",
    buttons: [
      {
        name: "所得税法",
        link: "/340AC0000000033",
        image: "/law.jpg",
        click: "topToSyotokuzeihou",
      },
      {
        name: "法人税法",
        link: "/340AC0000000034",
        image: "/law.jpg",
        click: "topToHoujinzeihou",
      },
      {
        name: "消費税法",
        link: "/363AC0000000108",
        image: "/law.jpg",
        click: "topToShouhizei",
      },
    ],
  },
  {
    summary: "知的財産法",
    buttons: [
      {
        name: "特許法",
        link: "/334AC0000000121",
        image: "/law.jpg",
        click: "topToTokkyo",
      },
      {
        name: "著作権法",
        link: "/345AC0000000048",
        image: "/law.jpg",
        click: "topToChosakuken",
      },
    ],
  },
];