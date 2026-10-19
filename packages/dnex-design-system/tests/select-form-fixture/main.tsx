import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Controller, useForm } from 'react-hook-form';
import { Select } from '../../src/components/primitives/Select';
import { Button } from '../../src/components/primitives/Button';
import './fixture.css';
const long = 'NOMEDEOPCAOSEMESPACOS'.repeat(7);
const items = [{ value: 'alpha', label: 'Opção Alpha' }, { value: 'long', label: long }, { value: 'denied', label: 'Indisponível', disabled: true }];
function App() { const { control, setFocus, reset, watch, formState: { errors, touchedFields } } = useForm<{
    category: string;
}>({ defaultValues: { category: '' }, mode: 'onBlur' }); const [disabled, setDisabled] = useState(false), [native, setNative] = useState(''), [payload, setPayload] = useState(''), [calls, setCalls] = useState(0), [resets, setResets] = useState(0); const editor = useRef<HTMLTextAreaElement>(null); return <main className="min-h-screen bg-surface p-4 text-fg"><form id="native-form" onSubmit={event => { event.preventDefault(); setPayload(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))); }}><Button type="submit">Enviar formulário nativo</Button></form><section className="flex max-w-xl flex-col gap-3"><label htmlFor="controlled">Categoria RHF</label><Controller name="category" control={control} rules={{ required: 'Escolha uma categoria' }} render={({ field }) => <Select {...field} id="controlled" items={items} placeholder="Escolha" disabled={disabled} required invalid={Boolean(errors.category)} aria-describedby="category-error" onValueChange={v => { field.onChange(v); setCalls(n => n + 1); }}/>}/><p id="category-error" className="min-h-6">{errors.category?.message ?? ''}</p><output className="sr-only" data-testid="touched">{String(Boolean(touchedFields.category))}</output><output data-testid="calls">{calls}</output><output data-testid="resets">{resets}</output><output data-testid="rhf-value">{watch("category")}</output><Button type="button" onClick={() => setFocus('category')}>Focar categoria</Button><Button type="button" onClick={() => { setResets(n => n + 1); reset({ category: '' }); }}>Limpar categoria</Button><Button type="button" onClick={() => setDisabled(v => !v)}>Alternar bloqueio</Button><label htmlFor="native">Valor nativo externo</label><Select id="native" name="nativeCategory" form="native-form" required items={items} value={native} onValueChange={setNative}/><output data-testid="payload">{payload}</output><label htmlFor="editor">Editor de teste</label><textarea id="editor" ref={editor}/><Select aria-label="Formatação do editor" items={items} onCloseAutoFocus={event => { event.preventDefault(); editor.current?.focus(); }}/></section></main>; }
;
function AsyncControlledForm() {
    const [options, setOptions] = useState<Array<{value: string; label: string}>>([]);
    const [value, setValue] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [changes, setChanges] = useState<string[]>([]);
    const [sibling, setSibling] = useState('');
    return <section className="flex max-w-xl flex-col gap-3">
        <form id="async-controlled-form">
            <label htmlFor="async-controlled">Bloco com opções assíncronas</label>
            <Select id="async-controlled" name="unitBlock" required value={value} placeholder="Selecione"
                items={options} onValueChange={next => { setChanges(previous => [...previous, next]); setValue(next === '__none__' ? '' : next); }}/>
            <label htmlFor="async-sibling">Código preservado</label>
            <input id="async-sibling" name="unitCode" value={sibling} onChange={event => setSibling(event.target.value)}/>
        </form>
        <Button type="button" onClick={async () => {
            await new Promise(resolve => setTimeout(resolve, 40));
            setOptions([{value: '__none__', label: 'Limpar bloco'}, {value: 'alpha', label: 'Torre Alpha'}, {value: 'beta', label: 'Torre Beta'}]);
            setValue('alpha');
            setLoaded(true);
        }}>Carregar opções e selecionar Alpha</Button>
        <output data-testid="async-loaded">{String(loaded)}</output>
        <output data-testid="async-value">{value}</output>
        <output data-testid="async-changes">{JSON.stringify(changes)}</output>
    </section>;
}
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).has('async-form')
    ? <main className="min-h-screen bg-surface p-4 text-fg"><AsyncControlledForm /></main>
    : <App />);
