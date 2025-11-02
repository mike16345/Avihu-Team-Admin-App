export const navRouteKey = (path: string) =>
  path === '/'
    ? 'home'
    : path
        .replace(/^\/+/u, '')
        .replace(/\/+/gu, '-')
        .replace(/[^a-zA-Z0-9-]/gu, '-')
        .toLowerCase();

export const ids = {
  navLink: (route: string) => `nav-${navRouteKey(route)}-link`,
  tableRows: 'table-rows',
  row: (id: string) => `row-${id}`,
  rowEdit: (id: string) => `row-${id}-edit`,
  rowDelete: (id: string) => `row-${id}-delete`,
  formField: (name: string) => `form-field-${name}`,
  formError: (name: string) => `form-error-${name}`,
  formSubmit: 'form-submit',
  createButton: 'create-button',
  loading: 'loading',
  emptyState: 'empty-state',
  toastSuccess: 'toast-success',
  alertError: 'alert-error',
} as const;

export type IdKey = keyof typeof ids;
