import clsx from 'clsx';
export default function Button({ variant = 'primary', className, ...props }) {
    return (<button className={clsx('inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none shadow-sm', variant === 'primary' && 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20', variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200', variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100', className)} {...props}/>);
}

