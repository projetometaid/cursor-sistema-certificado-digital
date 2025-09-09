module.exports = function ListOrdersUseCase({ orderRepository }){
  return { async execute(){ const items = await orderRepository.list(); return { ok:true, items }; } };
};
