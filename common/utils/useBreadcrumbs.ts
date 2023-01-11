import create from "zustand";

interface breadcrumbI {
  label: string;
  link: string;
}

interface useBreadcrumbsInterface {
  path: Partial<breadcrumbI>[];
  setPath: (val: breadcrumbI[]) => void;
}

const initialPath = [
  {
    label: "Home",
    link: "/",
  },
  {
    label: "Dashboard",
  },
];

const useBreadcrumbs = create<useBreadcrumbsInterface>((set) => ({
  path: initialPath,
  setPath: (val: breadcrumbI[]) => set(() => ({path: val})),
}));

export default useBreadcrumbs;
