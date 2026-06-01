import clsx from 'clsx';
export default function Button({ variant = 'primary', className, ...props }) {
    return (<button className={clsx('inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none', variant === 'primary' && 'bg-brand-600 text-white hover:bg-brand-700', variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200', variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100', className)} {...props}/>);
}
