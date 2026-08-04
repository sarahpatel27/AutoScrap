import { useState } from 'react';
import FAQList from '../components/FAQList';
import { CTA, PageHero } from '../components/Common';
import { faqs } from '../data/siteData';
export default function FAQPage(){const [search,setSearch]=useState('');const filtered=faqs.filter(([q,a])=>(q+' '+a).toLowerCase().includes(search.toLowerCase()));return <><PageHero eyebrow="Help centre" title="Frequently asked questions" text="Find answers about quotes, collection, payment, documentation and vehicle condition."/><section className="section"><div className="container narrow"><input className="faq-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions..."/><FAQList items={filtered}/>{!filtered.length&&<div className="empty-state">No matching questions found.</div>}</div></section><CTA/></>}
