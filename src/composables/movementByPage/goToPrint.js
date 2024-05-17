export default function goToHistory(router, route) {
  const url = router.resolve({
    name: 'documentPrint',
    params: { id: route.params.id }
  }).href;
  window.open(url, '_blank');
}
