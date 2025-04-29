export type Breadcrumb = { title: string, url: string };

export type ComplexBreadcrumb = Breadcrumb & { sub?: Breadcrumb[] };