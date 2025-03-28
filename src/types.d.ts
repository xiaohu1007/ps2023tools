// 图层节点类型
export interface LayerNode {
  id: string;
  name: string;
  children?: LayerNode[];
  selected?: boolean;
}

// 图片元数据类型
export interface ImageMeta {
  id: number;
  preview: string;
  path: string;
  templateID?: number;
  position?: string;
  file?: File;
}

// Excel单元格类型
export interface ExcelCell {
  t: 's' | 'n';
  v: string | number;
  image?: string;
}

declare module 'psd' {
  interface Layer {
    id: string;
    name: string;
    children?: Layer[];
    visible?: boolean;
  }
}