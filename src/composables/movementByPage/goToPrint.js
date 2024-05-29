export default function goToPrint(router, route, title) {
  const url = router.resolve({
    name: 'documentPrint',
    params: { id: route.params.id, title: title }
  }).href;
  window.open(url, '_blank');
}
