export default function Card({ children, className='' }){
  return <div className={`bg-white rounded-xl p-4 ${className}`} style={{boxShadow:'var(--shadow-md)'}}>{children}</div>;
}
