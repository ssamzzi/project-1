export interface VideoResource {
  title: string;
  url: string;
}

export interface ToolVideoMeta {
  videos: VideoResource[];
  extraLinks?: VideoResource[];
}

export const toolVideos: Record<string, ToolVideoMeta> = {
  'acid-dilution': {
    videos: [
      { title: 'How to Calculate Molarity and Make Solutions', url: 'https://www.youtube.com/watch?v=KLjWa9cE2uk' },
      { title: 'How to Calculate Molarity for a Solution', url: 'https://www.youtube.com/watch?v=0l8LNarA7G4' },
      { title: 'Preparing chemical solutions using the Sigma-Aldrich Mass Molarity calculator', url: 'https://www.youtube.com/watch?v=4RNR73nhbkM' },
    ],
  },
  'cloning-helper': {
    videos: [
      { title: 'Da (Daltons), kDa, MWCO (Molecular Weight Cut-Off) Explained', url: 'https://www.youtube.com/watch?v=QnuVS3_x6TA' },
    ],
  },
  a260: {
    videos: [
      { title: 'A260/A280 ratio, Nucleic Acid Concentration, Purity and Molarity', url: 'https://www.youtube.com/watch?v=JOkf08Q0HlY' },
      { title: 'DNA Quantitation Using a Spectrophotometer', url: 'https://www.youtube.com/watch?v=qw2ZaUXgWHU' },
    ],
  },
  'cell-doubling-time': {
    videos: [
      { title: 'Calculating Bacterial Doubling Time in Excel', url: 'https://www.youtube.com/watch?v=adYWnTPPWlM' },
      { title: "What's the Doubling Time Formula?", url: 'https://www.youtube.com/watch?v=Rr9t4sECvV0' },
    ],
  },
  hemocytometer: {
    videos: [
      { title: 'Counting Cells with a Hemocytometer', url: 'https://www.youtube.com/watch?v=pP0xERLUhyc' },
      { title: 'Counting cells using a hemocytometer video protocol', url: 'https://www.youtube.com/watch?v=GCohewzhD3k' },
    ],
  },
  ligation: {
    videos: [
      { title: 'How to calculate Molar Ratio of Insert:Vector for Ligation in Excel', url: 'https://www.youtube.com/watch?v=MIhjaIogHNg' },
      { title: 'What molar ratios should I use for DNA Ligation?', url: 'https://www.youtube.com/watch?v=z5P1hoWic-8' },
    ],
  },
  'pcr-master-mix': {
    videos: [
      { title: 'How To: PCR Calculations (Mastermix 계산)', url: 'https://www.youtube.com/watch?v=CnQV5_CEvAo' },
      { title: 'PCR Master Mix', url: 'https://www.youtube.com/watch?v=fXrAEODQcao' },
    ],
  },
  'qpcr-relative-quant': {
    videos: [
      { title: 'Analyzing Quantitative PCR Data', url: 'https://www.youtube.com/watch?v=y8tHiH0BzGY' },
    ],
    extraLinks: [
      { title: 'DeltaDeltaCt reference page', url: 'https://mdicu.com/How-to-Calculate-Ddct-Qpcr.php' },
    ],
  },
  reconstitution: {
    videos: [
      { title: 'Preparing chemical solutions using the Sigma-Aldrich Mass Molarity calculator', url: 'https://www.youtube.com/watch?v=4RNR73nhbkM' },
    ],
  },
  'serial-dilution': {
    videos: [
      { title: 'How to prepare a Serial Dilution', url: 'https://www.youtube.com/watch?v=yYWFX4IXc5Y' },
      { title: 'Planning Serial Dilutions', url: 'https://www.youtube.com/watch?v=VN517DqOwd8' },
    ],
  },
};
