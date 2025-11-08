export function bindClickHandler(container: any, onSelect: () => void) {
  container.onClick(() => {
    onSelect();
  });
}
