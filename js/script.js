// falling autumn leaves (hero only)
const hero=document.querySelector('.hero, .page-head');
if(hero&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const icons=['🍂','🍁','🍂','🦇'];
  for(let i=0;i<10;i++){
    const l=document.createElement('span');
    l.className='leaf';l.textContent=icons[i%icons.length];
    l.style.left=Math.random()*100+'%';
    l.style.animationDuration=8+Math.random()*8+'s';
    l.style.animationDelay=-Math.random()*12+'s';
    hero.appendChild(l);
  }
}
