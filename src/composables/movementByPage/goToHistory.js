export default function goToHistory(router, route) {
  const url = router.resolve({
    name: 'documentHistory',
    params: { id: route.params.id }
  }).href;
  window.open(url, '_blank');
}
