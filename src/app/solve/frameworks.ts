export const DEFAULT_QUESTION = "공룡은 왜 사라졌어?";

export type FrameworkMeta = {
  id: string;
  label: string;
  shortDesc: string;
};

export const FRAMEWORK_LIST: FrameworkMeta[] = [
  {
    id: "oheukwonchik",
    label: "육하원칙",
    shortDesc:
      "누가·언제·어디서·무엇을·왜·어떻게를 채워서 훨씬 자세한 질문을 만들어요.",
  },
  {
    id: "causeEffect",
    label: "원인과 결과",
    shortDesc:
      "무슨 일이 있었고(결과) 그게 왜 일어났는지(원인)를 짚어가며 질문을 만들어요.",
  },
];

export const FRAMEWORK_LABELS: Record<string, string> = Object.fromEntries(
  FRAMEWORK_LIST.map((f) => [f.id, f.label])
);

export const DEFAULT_FRAMEWORK_ID = FRAMEWORK_LIST[0].id;
