import { LawChapter, QuestionData } from "./types";

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
