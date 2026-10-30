// Authored story samples, selected only after the main input-safety checks.
export function authoredStory(message,activity=''){
 const q=message.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
 const reply=(text,choices,activity,code='story')=>({text,choices,activity,code,engine:'curated-v1'});
 const next=/^(continue|continue the story|next|what happens next|go on|yes|yes please|tell me more|keep going)$/;
 if(/\b(?:story|adventure)\b/.test(q)&&/\bdragon\b/.test(q))return reply('Bramble was a tiny dragon whose sneezes made bubbles. One morning, a cloud shaped like a pancake floated past his window. He packed a picnic basket. Should Bramble follow the cloud or visit the pond?',['Follow the cloud','Visit the pond'],'dragon-choice');
 if(/\b(?:story|adventure)\b/.test(q)&&/\b(?:space|moon|astronaut)\b/.test(q))return reply('Nia the astronaut landed on a moon made of soft blue moss. Her robot, Button, spotted a silver garden and a trail of tiny footprints. Should they explore the garden or follow the footprints?',['Explore the garden','Follow the footprints'],'moon-choice');
 if(activity==='dragon-choice'){
  if(/cloud|first|^1$/.test(q)||next.test(q))return reply('Bramble followed the cloud to a hill. It was carrying flour to the village baker! Bramble blew gentle bubbles to lift the flour inside, and the baker made a stack of warm pancakes. Should Bramble share them or save one for later?',['Share the pancakes','Save one for later'],'dragon-ending');
  if(/pond|second|^2$/.test(q))return reply('At the pond, Bramble found a duck whose picnic had floated away. He made a trail of bubbles, and the duck paddled safely after it. Inside the basket were warm pancakes! Should Bramble share them or save one for later?',['Share the pancakes','Save one for later'],'dragon-ending');
 }
 if(activity==='dragon-ending'&&(/share|save|first|second|later|^1$|^2$/.test(q)||next.test(q)))return reply('Bramble shared the pancakes with the duck and the baker, saving one for his walk home. Above them, the pancake cloud became a smiling moon. Bramble learned that an adventure tastes sweeter when kindness comes along. The end!',['Tell me a space story','Give me a riddle'],'','story-end');
 if(activity==='moon-choice'){
  if(/garden|first|^1$/.test(q)||next.test(q))return reply('In the garden, silver flowers rang like little bells. A moon mouse explained that one flower needed a star seed to bloom. Button found a seed beside a basket of moonberries. Should Nia plant the seed or share the berries?',['Plant a star seed','Share a moonberry'],'moon-ending');
  if(/footprint|second|^2$/.test(q))return reply('The footprints belonged to a moon mouse carrying a basket much bigger than itself. Nia helped carry it to the silver garden. Inside were moonberries and one glowing star seed. Should Nia plant the seed or share the berries?',['Plant a star seed','Share a moonberry'],'moon-ending');
 }
 if(activity==='moon-ending'&&(/plant|share|seed|berry|berries|first|second|^1$|^2$/.test(q)||next.test(q)))return reply('Nia planted the seed while Button shared the berries. A golden flower opened, lighting a path back to their rocket. The moon mouse waved a leaf goodbye. Nia’s log read: best discovery today, a new way to help. The end!',['Tell me a dragon story','Give me a riddle'],'','story-end');
 return null;
}
