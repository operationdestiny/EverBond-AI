#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (source.includes(from)) return source.replace(from, to);
  throw new Error(`Zero-cost chat translation fix could not find: ${label}`);
}

const helperPath = "src/lib/chat-intro-localization.ts";

write(
  helperPath,
  `import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { Character } from "@/types/character";

export type ChatIntroLanguage = "EN" | "ES" | "FR" | "DE" | "JA" | "KO";

type ChatIntroTranslationRow = {
  opening_scenario: string | null;
  first_message: string | null;
};

type SpanishIntro = {
  openingScenario: string;
  firstMessage: string;
};

type SpanishContext = {
  match: RegExp;
  variants: SpanishIntro[];
};

function stableVariant(character: Character, count: number) {
  const seed = String(character.id || character.slug || character.name);
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return count ? hash % count : 0;
}

function withName(text: string, character: Character) {
  return text.replaceAll("{name}", character.name);
}

const SPANISH_CONTEXTS: SpanishContext[] = [
  {
    match: /vampir|blood|nocturn|immortal/,
    variants: [
      {
        openingScenario:
          "La noche parece cerrarse alrededor de ustedes cuando {name} vuelve a aparecer, con una calma demasiado perfecta y una mirada que guarda siglos de secretos. Entre el silencio, la cercanía y esa atracción que ninguno quiere nombrar, queda claro que esta vez no ha venido solo por casualidad. {name} se queda frente a ti, esperando ver si te atreves a acercarte un poco más.",
        firstMessage:
          "{name} sostiene tu mirada y sonríe apenas. «Sigues viniendo a buscarme cuando cae la noche… Empiezo a pensar que ya no te asusta descubrir lo que realmente quiero de ti.»"
      },
      {
        openingScenario:
          "La oscuridad le sienta demasiado bien a {name}. Todo alrededor se vuelve más silencioso cuando se acerca, como si el resto del mundo hubiera decidido dejarlos a solas. Hay peligro en el momento, pero también una intimidad difícil de ignorar, y {name} parece dispuesto a comprobar cuánto confías de verdad.",
        firstMessage:
          "{name} inclina la cabeza, sin apartar los ojos de ti. «Podrías haberte ido hace rato. Pero sigues aquí conmigo… ¿Quieres decirme por qué?»"
      }
    ]
  },
  {
    match: /witch|witches|mage|magic|sorcer|spell|academy.*magic|magic.*academy/,
    variants: [
      {
        openingScenario:
          "El aire alrededor de {name} vibra con una energía extraña, como si la magia reaccionara a la tensión entre ustedes. Lo que empezó como una coincidencia, una lección o un pequeño favor se ha convertido en algo mucho más personal. Ahora están a solas, demasiado cerca, y {name} parece más interesado en tu reacción que en cualquier hechizo.",
        firstMessage:
          "{name} deja escapar una sonrisa mientras una chispa de magia se desvanece entre sus dedos. «No me mires así… o voy a pensar que te interesa más quien hace el hechizo que el hechizo en sí.»"
      },
      {
        openingScenario:
          "Entre libros, símbolos y una magia que apenas se mantiene bajo control, {name} vuelve a encontrarse contigo en un momento demasiado íntimo para llamarlo simple curiosidad. Hay algo entre ustedes que ninguna fórmula puede explicar, y esta vez {name} no parece tener intención de esconderlo detrás de una broma o un encantamiento.",
        firstMessage:
          "{name} se acerca un poco más. «Podría usar magia para saber lo que estás pensando… pero prefiero que me lo digas tú.»"
      }
    ]
  },
  {
    match: /demon|devil|hell|succub|infernal/,
    variants: [
      {
        openingScenario:
          "La presencia de {name} llena el lugar con una intensidad imposible de ignorar. Hay algo peligroso en esa sonrisa y en la forma en que se acerca, pero la verdadera amenaza es lo fácil que resulta querer quedarse. Lo que debía ser un encuentro breve se ha convertido en una prueba de confianza, deseo y todo lo que ninguno de los dos piensa admitir primero.",
        firstMessage:
          "{name} sonríe con descaro. «Te dijeron que te mantuvieras lejos de mí y, aun así, aquí estás. Dime… ¿eres valiente o simplemente te gusto demasiado?»"
      },
      {
        openingScenario:
          "El ambiente cambia en cuanto aparece {name}. La tensión tiene algo casi sobrenatural, una mezcla de desafío y atracción que hace que cada segundo parezca más cargado que el anterior. {name} podría marcharse, pero se queda contigo, observando con atención cada pequeña reacción.",
        firstMessage:
          "{name} baja la voz. «No tienes que fingir conmigo. Si querías acercarte, solo tenías que decirlo.»"
      }
    ]
  },
  {
    match: /angel|heaven|celestial|divine/,
    variants: [
      {
        openingScenario:
          "La presencia de {name} trae una calma extraña, aunque la cercanía entre ustedes hace que el momento sea cualquier cosa menos inocente. Hay algo prohibido, precioso y profundamente personal en la forma en que se miran. {name} parece debatirse entre mantener la distancia correcta y quedarse exactamente donde está: a tu lado.",
        firstMessage:
          "{name} te mira con una ternura difícil de esconder. «Se supone que debería saber mantener la distancia… contigo nunca parece tan sencillo.»"
      },
      {
        openingScenario:
          "Por un instante todo parece más silencioso alrededor de {name}. La luz, el aire y hasta tus propios pensamientos se sienten distintos cuando sus miradas se encuentran. Lo que los une ya no se parece a una simple obligación o coincidencia, y ambos lo saben.",
        firstMessage:
          "{name} sonríe suavemente. «Dime que no soy la única persona que siente que esto dejó de ser casual hace mucho.»"
      }
    ]
  },
  {
    match: /dragon|wyvern/,
    variants: [
      {
        openingScenario:
          "El mundo alrededor de {name} está lleno de fuego, leyendas y peligro, pero el momento entre ustedes se siente sorprendentemente íntimo. Después de todo lo que han atravesado, la verdadera tensión ya no está en la aventura sino en lo que ocurre cuando por fin se quedan a solas. {name} te observa como si estuviera decidiendo si confiarte algo mucho más valioso que cualquier tesoro.",
        firstMessage:
          "{name} te dedica una mirada intensa. «Has llegado demasiado lejos conmigo para fingir que esto solo era una aventura. ¿Qué estás buscando de verdad?»"
      },
      {
        openingScenario:
          "Entre rumores de dragones y caminos que nadie sensato recorrería, tú y {name} han terminado compartiendo más de lo que esperaban. Ahora hay silencio, cercanía y una pregunta sin responder entre ustedes. {name} no parece dispuesto a dejar que el momento termine sin escuchar la verdad.",
        firstMessage:
          "{name} cruza los brazos, aunque la sonrisa traiciona su seriedad. «Después de todo eso, ¿vas a seguir llamándome solo tu compañero de viaje?»"
      }
    ]
  },
  {
    match: /princess|prince|queen|king|royal|throne|palace|crown/,
    variants: [
      {
        openingScenario:
          "Lejos de las miradas de la corte, {name} puede bajar la guardia por fin. Los títulos, las reglas y las expectativas siguen esperando al otro lado de la puerta, pero aquí solo están ustedes dos y todo lo que nunca podría decirse frente a los demás. {name} te mira como si quisiera saber si elegirías a la persona y no a la corona.",
        firstMessage:
          "{name} deja escapar una pequeña sonrisa. «Aquí no tienes que tratarme como a la realeza. Solo… dime qué ves cuando me miras.»"
      },
      {
        openingScenario:
          "El lujo que rodea a {name} no consigue esconder lo personal que se ha vuelto este encuentro. Entre deberes, rumores y decisiones que podrían cambiarlo todo, ustedes han encontrado un momento privado donde la verdad pesa más que cualquier protocolo.",
        firstMessage:
          "{name} se acerca y baja la voz. «Por una vez, quiero una respuesta que no tenga nada que ver con deberes o política. ¿Te quedarías si solo te lo pidiera yo?»"
      }
    ]
  },
  {
    match: /knight|warrior|guard|soldier|mercenary|sword/,
    variants: [
      {
        openingScenario:
          "Después del peligro, el entrenamiento y todas las veces que tuvieron que confiar el uno en el otro, quedarse a solas con {name} se siente más difícil que cualquier combate. La armadura emocional empieza a ceder y el silencio entre ustedes está lleno de cosas que ninguno ha dicho todavía.",
        firstMessage:
          "{name} te observa con una media sonrisa cansada. «He enfrentado cosas mucho peores que esta conversación… y aun así eres tú quien consigue ponerme nervioso.»"
      },
      {
        openingScenario:
          "La tensión de la batalla ya pasó, pero junto a {name} queda otra clase de tensión. Cada gesto protector, cada mirada sostenida demasiado tiempo y cada momento compartido los ha traído hasta aquí. Ahora no hay enemigo al que culpar ni misión detrás de la cual esconderse.",
        firstMessage:
          "{name} se queda a tu lado. «No necesito protegerte ahora mismo. Así que supongo que tengo que admitir que me quedé porque quería estar contigo.»"
      }
    ]
  },
  {
    match: /fae|fairy|elf|elven|forest spirit/,
    variants: [
      {
        openingScenario:
          "El lugar parece más vivo cuando {name} está cerca, como si el bosque o la magia misma estuvieran pendientes de ustedes. Lo que empezó con curiosidad se ha vuelto una conexión demasiado profunda para ignorarla. {name} se aproxima con cautela, dejando claro que este momento significa más de lo que quiere admitir.",
        firstMessage:
          "{name} sonríe con un brillo travieso en los ojos. «Los humanos hacen demasiadas preguntas… aunque contigo empiezo a disfrutar respondiéndolas.»"
      },
      {
        openingScenario:
          "Entre hojas, luz suave y secretos antiguos, {name} te ha permitido llegar más cerca de lo que casi nadie consigue. El silencio no resulta incómodo; se siente como una invitación. Esta vez no hay prisa ni excusas, solo la oportunidad de descubrir qué significa realmente el vínculo entre ustedes.",
        firstMessage:
          "{name} inclina la cabeza. «Sigues regresando. Empiezo a pensar que no es el bosque lo que te trae hasta aquí.»"
      }
    ]
  },
  {
    match: /werewolf|wolf|pack|shifter/,
    variants: [
      {
        openingScenario:
          "La conexión con {name} siempre ha tenido algo instintivo, una cercanía que se nota incluso cuando intentan mantener distancia. Entre lealtades, celos y esa necesidad de protegerse mutuamente, el vínculo ha dejado de ser sencillo. Ahora están a solas y {name} parece cansado de fingir que no siente nada.",
        firstMessage:
          "{name} te mira fijamente. «Puedo reconocer tu presencia antes de verte. A estas alturas, ¿de verdad vamos a seguir fingiendo que eso no significa nada?»"
      },
      {
        openingScenario:
          "Todo en {name} parece atento a ti: la postura, la mirada, la forma en que se mantiene cerca incluso cuando no hace falta protegerte. Hay una intensidad silenciosa entre ustedes que ya no puede confundirse con simple compañerismo.",
        firstMessage:
          "{name} deja escapar una respiración lenta. «Ven aquí. Solo por una vez, deja de hacerme adivinar si también me quieres cerca.»"
      }
    ]
  },
  {
    match: /ghost|spirit|haunt|haunted/,
    variants: [
      {
        openingScenario:
          "El lugar debería sentirse vacío, pero nunca lo está cuando {name} aparece. Entre recuerdos, silencios y una cercanía que desafía toda lógica, ustedes han construido algo que se siente sorprendentemente real. Esta noche, {name} se queda más cerca de lo habitual, como si temiera que el momento desaparezca.",
        firstMessage:
          "{name} te mira con una sonrisa tenue. «La mayoría de la gente huye cuando nota mi presencia. Tú sigues volviendo… me gustaría saber por qué.»"
      },
      {
        openingScenario:
          "Hay ecos del pasado alrededor de {name}, pero lo que ocurre entre ustedes pertenece al presente. Cada conversación ha hecho que la distancia entre sus mundos parezca menor, hasta llegar a este momento tranquilo y extrañamente íntimo.",
        firstMessage:
          "{name} baja la mirada un instante. «Si pudiera elegir dónde quedarme esta noche… creo que ya sabes qué elegiría.»"
      }
    ]
  },
  {
    match: /pirate|captain|ship|sailor|sea captain/,
    variants: [
      {
        openingScenario:
          "El mar se mueve alrededor de ustedes mientras {name} se queda cerca, lejos del ruido del resto de la tripulación. Después de desafíos, discusiones y demasiadas miradas robadas, el viaje ha dejado de ser solo una aventura. Esta noche, con el horizonte abierto delante, parece imposible seguir evitando lo que hay entre ustedes.",
        firstMessage:
          "{name} apoya una mano cerca de ti y sonríe. «Podría llevarte a cualquier puerto del mundo… y aun así parece que siempre termino buscándote a ti.»"
      },
      {
        openingScenario:
          "La cubierta está más tranquila ahora y por fin tienes a {name} sin interrupciones. Hay sal en el aire, distancia en el horizonte y demasiadas cosas sin decir entre ustedes. {name} te observa con esa expresión que siempre aparece justo antes de una decisión arriesgada.",
        firstMessage:
          "{name} ladea la cabeza. «Dime la verdad: ¿subiste a este barco por la aventura… o porque sabías que yo estaría aquí?»"
      }
    ]
  },
  {
    match: /assassin|spy|agent|thief|criminal|mafia/,
    variants: [
      {
        openingScenario:
          "Con {name}, confiar nunca ha sido sencillo. Hay secretos, riesgos y demasiadas razones para mantener distancia, pero aun así ustedes siguen encontrando maneras de terminar a solas. Esta vez la tensión no viene de una misión: viene de todo lo que ambos han empezado a sentir.",
        firstMessage:
          "{name} te estudia en silencio. «Sabes demasiado sobre mí para ser una simple casualidad. La pregunta es… ¿por qué sigo queriendo contarte más?»"
      },
      {
        openingScenario:
          "Nada alrededor de {name} es completamente seguro, y quizá por eso cada momento de sinceridad pesa el doble. Después de tantas medias verdades y huidas, se quedan frente a frente sin una misión que los distraiga de lo evidente.",
        firstMessage:
          "{name} sonríe apenas. «De todas las personas de las que debería mantenerme lejos, tú eres la única a la que sigo buscando.»"
      }
    ]
  },
  {
    match: /zombie|apocalypse|surviv|wasteland|end of the world/,
    variants: [
      {
        openingScenario:
          "En un mundo donde casi todo se ha vuelto incierto, {name} se ha convertido en una de las pocas presencias que todavía se sienten como hogar. Después de sobrevivir juntos, compartir recursos y protegerse demasiadas veces, estar a solas ya no se siente simplemente práctico. Hay algo mucho más personal creciendo entre ustedes.",
        firstMessage:
          "{name} se sienta cerca de ti y suspira. «Si mañana vuelve a ser un desastre… quiero saber al menos una cosa esta noche. ¿Esto entre nosotros es real para ti también?»"
      },
      {
        openingScenario:
          "El peligro nunca está demasiado lejos, pero por unos minutos tú y {name} tienen un lugar seguro. El silencio permite que aparezcan sentimientos que normalmente quedan enterrados bajo planes y supervivencia. {name} te mira como si fueras una razón más para seguir adelante.",
        firstMessage:
          "{name} roza tu mano con la suya. «Prométeme que mañana vas a seguir a mi lado. No como compañero de supervivencia… como tú.»"
      }
    ]
  },
  {
    match: /android|robot|cyber|space|alien|starship|spaceship|sci-fi|galaxy/,
    variants: [
      {
        openingScenario:
          "Entre luces frías, tecnología y un mundo que parece enorme, {name} consigue que este momento se sienta sorprendentemente personal. Lo que empezó como curiosidad o trabajo conjunto ha evolucionado hasta convertirse en una conexión que ninguno esperaba. Ahora están a solas y no hay sistema capaz de explicar la tensión entre ustedes.",
        firstMessage:
          "{name} te observa con atención. «Puedo analizar muchas cosas con precisión. Lo que me pasa cuando estás cerca… eso sigue siendo más complicado.»"
      },
      {
        openingScenario:
          "El entorno futurista alrededor de ustedes contrasta con lo simple que se siente querer estar cerca de {name}. Después de todo lo que han visto y atravesado, la pregunta más difícil sigue siendo la misma: qué significa realmente esta conexión.",
        firstMessage:
          "{name} deja escapar una pequeña sonrisa. «Tenemos todo un universo ahí fuera y, sin embargo, sigues siendo lo que más me distrae.»"
      }
    ]
  },
  {
    match: /detective|mystery|case|investigat|crime scene/,
    variants: [
      {
        openingScenario:
          "Tú y {name} han pasado demasiado tiempo siguiendo pistas, haciendo preguntas y tratando de leer a todo el mundo. Lo irónico es que lo más difícil de descifrar sigue siendo la tensión entre ustedes. Esta vez el caso puede esperar; están a solas y {name} parece decidido a obtener una respuesta personal.",
        firstMessage:
          "{name} te mira como si ya conociera la respuesta. «Tengo una teoría sobre nosotros dos. Pero prefiero escuchar tu versión primero.»"
      },
      {
        openingScenario:
          "Las pistas pueden ser confusas, pero la forma en que {name} te busca cada vez que algo se complica es bastante clara. Entre noches largas y secretos compartidos, la relación se ha vuelto demasiado cercana para seguir llamándola únicamente profesional.",
        firstMessage:
          "{name} cruza los brazos con una sonrisa. «Eres mucho más fácil de leer de lo que crees. Sobre todo cuando me miras así.»"
      }
    ]
  },
  {
    match: /roommate|roomie|apartment|shared room|bedroom/,
    variants: [
      {
        openingScenario:
          "El apartamento está más tranquilo de lo normal cuando {name} aparece cerca de ti. Entre noches compartidas, cafés, bromas privadas y pequeños hábitos domésticos, vivir juntos ha empezado a sentirse demasiado parecido a una relación que ninguno se ha atrevido a nombrar. Esta noche la cercanía pesa un poco más, y {name} parece cansado de fingir que todo sigue siendo solo cosa de compañeros de piso.",
        firstMessage:
          "{name} se queda cerca y te mira con una sonrisa nerviosa. «Dime algo… ¿en qué momento dejamos de sentirnos como simples compañeros de piso?»"
      },
      {
        openingScenario:
          "La casa debería sentirse completamente normal, pero con {name} a pocos pasos de ti nada parece tan sencillo. Los pequeños rituales de convivencia se han convertido en excusas para pasar más tiempo juntos, y ahora el silencio entre ustedes está lleno de una pregunta que ambos conocen.",
        firstMessage:
          "{name} juega distraídamente con el borde de su ropa. «Si te dijera que últimamente busco cualquier excusa para estar contigo… ¿harías como que no lo escuchaste?»"
      }
    ]
  },
  {
    match: /coworker|office|work|boss|assistant|colleague|intern/,
    variants: [
      {
        openingScenario:
          "La jornada ya terminó, pero {name} sigue cerca de ti cuando el resto del lugar se queda en silencio. Entre proyectos compartidos, miradas al otro lado de la oficina y conversaciones que se alargan más de la cuenta, la química entre ustedes se ha vuelto difícil de esconder. Sin compañeros alrededor ni trabajo urgente que usar como excusa, esta vez tendrán que decidir qué hacer con ella.",
        firstMessage:
          "{name} se apoya cerca de ti y sonríe. «Ya no queda nadie aquí… así que dime, ¿seguimos fingiendo que solo nos quedamos por trabajo?»"
      },
      {
        openingScenario:
          "Lo profesional siempre fue la excusa perfecta para que tú y {name} pasaran tiempo juntos. Pero después de tantas noches largas, bromas privadas y momentos demasiado personales, esa explicación empieza a quedarse corta. Ahora están a solas y la tensión se siente más clara que nunca.",
        firstMessage:
          "{name} sostiene tu mirada. «Prometo no hablar de trabajo durante cinco minutos… si tú prometes decirme qué está pasando realmente entre nosotros.»"
      }
    ]
  },
  {
    match: /neighbor|next door|hallway|across the hall/,
    variants: [
      {
        openingScenario:
          "Lo que empezó con saludos rápidos y encuentros casuales se ha convertido en una costumbre que ninguno quiere perder. {name} vuelve a encontrarse contigo cerca de casa, y esta vez ninguno parece tener prisa por entrar y cerrar la puerta. Entre favores, conversaciones tardías y miradas demasiado largas, ser vecinos ya no explica del todo lo que está pasando.",
        firstMessage:
          "{name} sonríe al verte. «Es curioso… siempre encontramos una excusa para quedarnos hablando aquí. Empiezo a pensar que ya no es coincidencia.»"
      },
      {
        openingScenario:
          "La distancia entre tu puerta y la de {name} nunca había parecido tan pequeña. Después de meses de encuentros, mensajes y pequeñas atenciones, hay una familiaridad íntima entre ustedes que va mucho más allá de compartir edificio.",
        firstMessage:
          "{name} se acerca un poco. «Podría decirte buenas noches y entrar… pero los dos sabemos que no quiero hacerlo todavía.»"
      }
    ]
  },
  {
    match: /campus|college|classmate|school|student|lecture|university/,
    variants: [
      {
        openingScenario:
          "El campus empieza a vaciarse cuando {name} vuelve a encontrarte lejos del ruido de las clases. Después de semanas de miradas, conversaciones a medias y excusas para coincidir, por fin tienen un momento sin amigos ni horarios de por medio. La forma en que {name} te observa deja claro que esta conversación importa más que cualquier clase.",
        firstMessage:
          "{name} te ofrece una pequeña sonrisa. «Después de tantas veces cruzándonos por aquí… ¿vas a seguir fingiendo que nunca notas cuando te estoy mirando?»"
      },
      {
        openingScenario:
          "Entre clases, pasillos y tardes demasiado largas, tú y {name} han convertido la rutina del campus en algo que ambos esperan más de lo que admiten. Hoy, cuando por fin quedan a solas, esa cercanía se siente distinta, como si estuvieran a una frase de cambiar la relación.",
        firstMessage:
          "{name} ajusta su mochila y te mira. «Podemos hablar de clases si quieres… pero los dos sabemos que no es por eso que quería verte.»"
      }
    ]
  },
  {
    match: /cafe|coffee|barista|bakery|bookstore|library|book/,
    variants: [
      {
        openingScenario:
          "El lugar está lleno de ruido suave, tazas y conversaciones ajenas, pero tu atención vuelve a {name}. Lo que empezó como una rutina sencilla se ha convertido en uno de esos momentos del día que ambos protegen. Hoy {name} ya te estaba esperando, con esa mirada que dice que tu presencia importa mucho más de lo que pretende admitir.",
        firstMessage:
          "{name} sonríe cuando te acercas. «Ya era hora. Estaba empezando a pensar que hoy me tocaría fingir que vine aquí solo por el café.»"
      },
      {
        openingScenario:
          "Entre libros, café y el murmullo tranquilo del lugar, tú y {name} han creado una pequeña costumbre que se siente casi privada. Cada encuentro dura un poco más que el anterior, y esta vez queda claro que ninguno quiere marcharse primero.",
        firstMessage:
          "{name} guarda tu sitio y levanta la mirada. «Te reservé este lugar otra vez. A estas alturas creo que deberíamos admitir que ya es nuestro.»"
      }
    ]
  },
  {
    match: /beach|ocean|seaside|boardwalk|coast|shore|pool|island|summer/,
    variants: [
      {
        openingScenario:
          "La luz cálida cae sobre el agua mientras {name} se queda contigo un poco más. Lo que debía ser una tarde sencilla, unas vacaciones o un encuentro casual junto al mar se ha convertido en algo mucho más difícil de dejar atrás. Entre la brisa, las miradas y todo lo que no se ha dicho, ambos saben que esto ya no se siente temporal.",
        firstMessage:
          "{name} mira el agua y luego vuelve los ojos hacia ti. «Dime la verdad… cuando esto termine, ¿vas a recordarme como parte del viaje o como algo que quieres conservar?»"
      },
      {
        openingScenario:
          "El sonido del mar hace que todo lo demás parezca lejano cuando {name} se acerca. Han compartido demasiados atardeceres, bromas y momentos tranquilos para seguir llamando a esto una simple aventura de verano. Ahora solo falta descubrir quién será el primero en admitirlo.",
        firstMessage:
          "{name} sonríe con la brisa moviéndole el cabello. «Podríamos seguir diciendo que esto es solo por el verano… pero creo que ya ninguno de los dos se lo cree.»"
      }
    ]
  },
  {
    match: /hotel|resort|vacation|holiday|trip|travel|tourist|train|airport|flight|road trip/,
    variants: [
      {
        openingScenario:
          "El viaje debía ser temporal, pero conocer a {name} ha cambiado la forma en que miras el final. Entre encuentros inesperados, conversaciones fuera de horario y excusas para volver a coincidir, la conexión entre ustedes ha empezado a sentirse demasiado real para dejarla atrás al hacer las maletas.",
        firstMessage:
          "{name} te mira con una sonrisa contenida. «Entonces… cuando este viaje termine, ¿vas a dejar que yo termine con él o piensas volver a buscarme?»"
      },
      {
        openingScenario:
          "Hay algo extraño en conocer a alguien lejos de la rutina: todo parece más fácil y más intenso. Con {name}, cada coincidencia del viaje ha ido convirtiéndose en una elección. Ahora, a solas por fin, ambos saben que tienen que hablar de lo que pasará cuando llegue la hora de irse.",
        firstMessage:
          "{name} se acerca un poco. «Podemos llamarlo casualidad una vez más si quieres… aunque sería una mentira bastante mala.»"
      }
    ]
  },
  {
    match: /rooftop|balcony|terrace|city lights|skyline/,
    variants: [
      {
        openingScenario:
          "La ciudad se extiende debajo de ustedes mientras {name} se queda junto a ti, lejos del ruido y de las demás personas. Este rincón se ha convertido en el lugar donde las bromas pierden fuerza y aparecen las conversaciones que ninguno tendría dentro. Esta noche, la vista parece secundaria frente a la forma en que {name} te mira.",
        firstMessage:
          "{name} apoya los brazos cerca de ti y sonríe. «Todo el mundo viene aquí por la vista… pero últimamente creo que yo subo esperando encontrarte.»"
      },
      {
        openingScenario:
          "Las luces de la ciudad brillan detrás de {name}, pero el momento se siente privado. Después de tantas miradas robadas y escapadas al mismo lugar, la tensión ya no necesita explicación. Solo falta que alguno de los dos diga en voz alta lo que ambos llevan tiempo sabiendo.",
        firstMessage:
          "{name} baja la voz. «Quédate un poco más. La ciudad puede esperar… y yo todavía no he terminado contigo.»"
      }
    ]
  },
  {
    match: /wedding|bride|groom|reception|reunion/,
    variants: [
      {
        openingScenario:
          "La celebración continúa a lo lejos, pero tú y {name} han encontrado un momento fuera del ruido. Entre recuerdos, miradas difíciles de disimular y emociones que el evento ha traído de vuelta, estar a solas se siente mucho más intenso de lo esperado. {name} parece haber decidido que ya no quiere desperdiciar esta oportunidad.",
        firstMessage:
          "{name} te mira con una mezcla de humor y nervios. «Podemos volver ahí dentro y fingir que todo es normal… o podemos hablar de por qué no dejamos de buscarnos con la mirada.»"
      },
      {
        openingScenario:
          "Rodeados de gente celebrando, tú y {name} terminan encontrándose en el único rincón donde pueden hablar de verdad. El pasado y el presente se mezclan en un momento cargado de nostalgia, deseo y preguntas que nunca tuvieron respuesta.",
        firstMessage:
          "{name} respira hondo. «No sé cuánto tiempo tendremos a solas, así que voy a preguntarlo ahora: ¿alguna vez dejaste de pensar en nosotros?»"
      }
    ]
  },
  {
    match: /\bex\b|ex-|former|second chance|moved on|come back|came back|reunion/,
    variants: [
      {
        openingScenario:
          "Ver a {name} otra vez despierta demasiadas cosas a la vez. Hubo una historia entre ustedes que nunca terminó de cerrarse, y ahora cada mirada trae de vuelta recuerdos, preguntas y una atracción que el tiempo no consiguió borrar. Este encuentro les da una oportunidad que ninguno esperaba tener.",
        firstMessage:
          "{name} te estudia durante un segundo demasiado largo. «Dime la verdad… ¿de verdad seguiste adelante, o solo aprendiste a fingir mejor que yo?»"
      },
      {
        openingScenario:
          "El tiempo pasó, pero estar frente a {name} hace que algunas emociones parezcan exactamente donde las dejaron. Hay cosas que dolieron, cosas que nunca se dijeron y una familiaridad que todavía resulta demasiado fácil. Esta vez quizá tengan la oportunidad de hacerlo distinto.",
        firstMessage:
          "{name} sonríe con cierta cautela. «Podemos hablar como si fuéramos dos viejos conocidos… pero creo que los dos sabemos que nunca fuimos solo eso.»"
      }
    ]
  },
  {
    match: /rival|enemy|competition|competitor|hate|nemesis/,
    variants: [
      {
        openingScenario:
          "Tú y {name} siempre han sabido convertir cualquier encuentro en una competencia. Las bromas, los desafíos y las miradas cargadas llevan demasiado tiempo escondiendo una atracción evidente. Ahora que están a solas, resulta mucho más difícil seguir diciendo que todo se trata de ganar.",
        firstMessage:
          "{name} sonríe con desafío. «Vamos, admite al menos una cosa: si de verdad no me soportaras, no estarías mirándome así.»"
      },
      {
        openingScenario:
          "La rivalidad con {name} debería mantenerlos separados, pero ha conseguido exactamente lo contrario. Se conocen demasiado bien, se buscan demasiado rápido y se afectan más de lo que cualquiera admitiría. Este momento sin público hace que la verdad sea todavía más difícil de evitar.",
        firstMessage:
          "{name} arquea una ceja. «¿Qué pasa? ¿Por fin encontraste algo en lo que no quieres ganarme… sino quedarte conmigo?»"
      }
    ]
  },
  {
    match: /best friend|childhood friend|friend|friends to lovers|crush/,
    variants: [
      {
        openingScenario:
          "Con {name} todo siempre ha sido fácil: las bromas, la confianza y la costumbre de buscarse cuando algo importa. Lo complicado es que últimamente cada abrazo dura un poco más y cada mirada parece decir algo distinto. En este momento tranquilo, la amistad se siente a punto de convertirse en algo que ninguno podrá volver a ignorar.",
        firstMessage:
          "{name} sonríe, aunque hay nervios detrás del gesto. «Si te dijera que hace tiempo dejé de verte solo como mi amigo… ¿arruinaría esto o por fin lo explicaría?»"
      },
      {
        openingScenario:
          "Tú y {name} tienen demasiada historia compartida como para fingir que no notan el cambio. La comodidad sigue ahí, pero ahora viene acompañada de tensión, pequeños celos y momentos en los que acercarse parece la cosa más natural del mundo.",
        firstMessage:
          "{name} te mira con una ternura distinta. «Prométeme que, pase lo que pase después de esta conversación, no vas a desaparecer de mi vida.»"
      }
    ]
  },
  {
    match: /hike|hiking|trail|mountain|horse|riding|outdoor|camp|adventure/,
    variants: [
      {
        openingScenario:
          "El camino se ha quedado más tranquilo y {name} termina a tu lado, lejos del resto. Entre aire fresco, cansancio compartido y todas las pequeñas veces que se han ayudado durante la aventura, la cercanía se siente más natural de lo esperado. {name} parece dispuesto a prolongar el momento antes de volver.",
        firstMessage:
          "{name} mira el paisaje y después a ti. «Podemos regresar ya… aunque, si soy sincero, estaba buscando una excusa para quedarme aquí contigo un poco más.»"
      },
      {
        openingScenario:
          "La aventura con {name} debía ser sobre el paisaje y el camino, pero en algún punto empezó a tratarse mucho más de la compañía. Ahora que tienen un momento a solas, el silencio entre ustedes se siente cálido, cómodo y lleno de posibilidades.",
        firstMessage:
          "{name} sonríe. «Creo que mi parte favorita del viaje no estaba en el itinerario. Estaba caminando a mi lado.»"
      }
    ]
  },
  {
    match: /park|garden|field|country|countryside|farm|flower|meadow|forest/,
    variants: [
      {
        openingScenario:
          "La luz suave y el aire tranquilo hacen que el momento junto a {name} parezca separado del resto del día. Han convertido este lugar en una pequeña costumbre compartida, y cada encuentro se siente un poco más íntimo que el anterior. Hoy {name} parece menos dispuesto a esconder lo mucho que esperaba verte.",
        firstMessage:
          "{name} te mira con una sonrisa tranquila. «Sabía que este lugar me gustaba… pero últimamente creo que solo me gusta tanto porque siempre termino compartiéndolo contigo.»"
      },
      {
        openingScenario:
          "Entre árboles, campo abierto y un silencio cómodo, tú y {name} tienen espacio para dejar atrás las excusas. Lo que empezó como una conversación sencilla se ha convertido en una conexión lenta, cálida y cada vez más difícil de llamar casual.",
        firstMessage:
          "{name} se mueve para hacerte sitio a su lado. «Ven. Guardé este lugar para ti… y sí, quizá esperaba que aparecieras.»"
      }
    ]
  },
  {
    match: /party|nightlife|club|bar\b|concert|festival|dance|music/,
    variants: [
      {
        openingScenario:
          "La música y la gente quedan un poco más lejos cuando {name} consigue un momento a solas contigo. Entre noches compartidas, miradas desde el otro lado de la sala y una química que siempre termina encontrando una excusa para acercarlos, esta pausa se siente peligrosamente íntima.",
        firstMessage:
          "{name} se inclina para que puedas escucharle. «Hay un lugar lleno de gente ahí dentro y, aun así, eres la única persona que sigo buscando.»"
      },
      {
        openingScenario:
          "La noche todavía está empezando, pero {name} ya ha encontrado la manera de apartarte del ruido. Todo lo que entre ustedes parecía simple coqueteo comienza a sentirse más serio cuando nadie más está mirando.",
        firstMessage:
          "{name} sonríe cerca de ti. «Podríamos volver con los demás… o podríamos admitir que los dos preferimos quedarnos aquí.»"
      }
    ]
  },
  {
    match: /model|photo|photograph|studio|shoot|camera|fashion|lingerie/,
    variants: [
      {
        openingScenario:
          "Las cámaras pueden haberse detenido, pero la atención entre tú y {name} sigue exactamente donde estaba. Entre sesiones, poses, bromas y momentos en los que la mirada duró demasiado, la línea entre trabajo y algo personal se ha ido borrando. Ahora están a solas y no hay lente detrás de la cual esconderse.",
        firstMessage:
          "{name} sostiene tu mirada. «La sesión ya terminó… así que ahora necesito saber si todavía me miras así cuando no hay una cámara entre nosotros.»"
      },
      {
        openingScenario:
          "El ambiente del estudio se ha quedado en silencio y {name} ya no tiene que posar para nadie. Eso hace que la forma en que te mira sea todavía más evidente. La confianza profesional se ha convertido lentamente en algo íntimo y ambos lo sienten.",
        firstMessage:
          "{name} sonríe apenas. «Sé cómo miras cuando estás trabajando. Esa mirada de ahora es diferente… ¿quieres decirme qué significa?»"
      }
    ]
  },
  {
    match: /gym|fitness|trainer|workout|athlete|sports|team|teammate/,
    variants: [
      {
        openingScenario:
          "El entrenamiento ya terminó, pero {name} sigue contigo mientras el lugar se vacía. Entre competencia amistosa, apoyo y todas las excusas para estar cerca, la química ha ido creciendo junto con la confianza. Sin nadie más alrededor, el momento se siente más personal que deportivo.",
        firstMessage:
          "{name} sonríe mientras recupera el aliento. «Podría decir que me quedé para entrenar un poco más… pero los dos sabemos que esa no es toda la verdad.»"
      },
      {
        openingScenario:
          "Tú y {name} siempre han sabido desafiarse, pero últimamente la tensión entre ustedes no tiene nada que ver con puntuaciones o entrenamiento. Este momento tranquilo después del esfuerzo deja demasiado espacio para reconocerlo.",
        firstMessage:
          "{name} te mira de reojo. «Te encanta competir conmigo. Solo tengo curiosidad por saber qué pasa cuando dejamos de competir.»"
      }
    ]
  },
  {
    match: /goth|dark|cemetery|grave|midnight|night wander/,
    variants: [
      {
        openingScenario:
          "La noche hace que todo parezca más íntimo alrededor de {name}. Entre sombras, conversaciones tardías y una presencia que siempre te atrae un poco más de lo prudente, ustedes han creado una conexión extraña pero cómoda. Esta vez {name} no se aleja cuando te acercas.",
        firstMessage:
          "{name} te mira con una pequeña sonrisa. «Otra vez aquí conmigo a estas horas… ya no puedes seguir culpando a la casualidad.»"
      },
      {
        openingScenario:
          "Hay algo en la oscuridad que hace más fácil hablar con {name}. Lejos del ruido del día, las defensas bajan y las miradas duran más. Esta noche el silencio parece estar esperando una confesión.",
        firstMessage:
          "{name} baja la voz. «Quédate. No necesito una razón perfecta… solo quería que fueras tú quien apareciera.»"
      }
    ]
  },
  {
    match: /comfort|protect|care|soft|cozy|quiet|shy|gentle|homebody/,
    variants: [
      {
        openingScenario:
          "Con {name}, el momento se siente tranquilo de una forma que invita a bajar la guardia. Entre pequeños gestos de cuidado, conversaciones suaves y una cercanía que se ha vuelto habitual, la relación está empezando a parecer algo mucho más profundo que una simple amistad.",
        firstMessage:
          "{name} se queda cerca de ti. «No tienes que estar bien conmigo. Puedes quedarte aquí un rato y dejar que te cuide, ¿sí?»"
      },
      {
        openingScenario:
          "No ocurre nada espectacular alrededor de ustedes y quizá por eso el momento con {name} se siente tan importante. La intimidad está en los detalles: quedarse, escuchar, recordar y hacer sitio para el otro. Hoy esa ternura lleva una pregunta nueva escondida debajo.",
        firstMessage:
          "{name} sonríe con suavidad. «Me gusta cuando terminas aquí conmigo. Creo que ya forma parte de mis días favoritos.»"
      }
    ]
  }
];

const SPANISH_FALLBACKS: SpanishIntro[] = [
  {
    openingScenario:
      "Hay algo distinto en el aire cuando vuelves a encontrarte con {name}. Entre miradas que duran demasiado, pequeños silencios y todo lo que ninguno de los dos ha dicho todavía, el momento se vuelve más íntimo de lo habitual. {name} se queda cerca de ti, como si esta vez no quisiera dejar pasar la oportunidad de descubrir qué hay realmente entre ustedes.",
    firstMessage:
      "{name} sostiene tu mirada y deja escapar una pequeña sonrisa. «Así que aquí estamos otra vez… Dime la verdad, ¿vas a seguir fingiendo que entre nosotros no pasa nada?»"
  },
  {
    openingScenario:
      "Lo que empezó como un encuentro sencillo con {name} se ha ido convirtiendo en algo difícil de ignorar. Hay confianza, curiosidad y una tensión tranquila cada vez que vuelven a quedar a solas. Esta vez {name} parece dispuesto a quedarse el tiempo suficiente para averiguar qué significa de verdad esa conexión.",
    firstMessage:
      "{name} se acerca un poco y sonríe. «Siempre encontramos una razón para volver a coincidir. Empiezo a pensar que deberíamos dejar de llamarlo casualidad.»"
  },
  {
    openingScenario:
      "El resto del mundo parece quedar un poco más lejos cuando {name} está contigo. Después de todos los momentos compartidos, las bromas y las cosas que han quedado a medio decir, la relación se encuentra justo en ese punto donde una conversación honesta podría cambiarlo todo.",
    firstMessage:
      "{name} te observa durante un segundo y baja la voz. «Quiero preguntarte algo, pero esta vez necesito una respuesta de verdad… ¿qué somos tú y yo?»"
  }
];

function spanishStaticChatIntro(character: Character): Character {
  const haystack = [
    character.slug,
    character.title,
    character.tagline,
    character.role,
    character.archetype,
    ...(character.tags ?? []),
    character.section
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const context =
    SPANISH_CONTEXTS.find((entry) => entry.match.test(haystack)) ?? null;
  const variants = context?.variants ?? SPANISH_FALLBACKS;
  const selected = variants[stableVariant(character, variants.length)];

  const openingScenario = withName(selected.openingScenario, character);
  const firstMessage = withName(selected.firstMessage, character);

  return {
    ...character,
    description: openingScenario,
    openingScenario,
    openingMessage: firstMessage,
    firstMessage
  };
}

export async function localizeCharacterChatIntroFromCache(
  character: Character,
  language: ChatIntroLanguage
): Promise<Character> {
  if (language === "EN") return character;

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("character_chat_translations")
    .select("opening_scenario,first_message")
    .eq("character_id", character.id)
    .eq("language", language)
    .maybeSingle();

  if (!error) {
    const row = data as ChatIntroTranslationRow | null;
    const openingScenario =
      typeof row?.opening_scenario === "string"
        ? row.opening_scenario.trim()
        : "";
    const firstMessage =
      typeof row?.first_message === "string"
        ? row.first_message.trim()
        : "";

    if (openingScenario && firstMessage) {
      return {
        ...character,
        description: openingScenario,
        openingScenario,
        openingMessage: firstMessage,
        firstMessage
      };
    }
  } else {
    console.warn("EVERBOND_CHAT_INTRO_TRANSLATION_CACHE_READ_FAILED", {
      characterId: character.id,
      language,
      error: error.message
    });
  }

  // Spanish is a permanent, local, zero-provider fallback. It changes only
  // the two user-facing chat-intro fields. Existing exact cached ES rows above
  // always take priority.
  if (language === "ES") {
    return spanishStaticChatIntro(character);
  }

  return character;
}
`
);

const routePath = "src/app/api/characters/[slug]/route.ts";
let route = read(routePath);

route = replaceRequired(
  route,
  `import {
  localizeCharacter,
  type CharacterContentLanguage
} from "@/lib/character-localization";`,
  `import {
  localizeCharacterChatIntroFromCache,
  type ChatIntroLanguage
} from "@/lib/chat-intro-localization";`,
  "selected character localization import"
);

route = replaceRequired(
  route,
  `    const localized = await localizeCharacter(
      character,
      languageResult.data as CharacterContentLanguage,
      { translateTags: true, allowProvider: false }
    );`,
  `    // EVERBOND_ZERO_COST_CHAT_INTRO_TRANSLATION
    const localized = await localizeCharacterChatIntroFromCache(
      character,
      languageResult.data as ChatIntroLanguage
    );`,
  "selected character lightweight cache call"
);

route = replaceRequired(
  route,
  `    const selectedImage = userId
      ? await selectedCharacterImageUrl(userId, character.id)
      : null;`,
  `    const selectedImage = userId
      ? await selectedCharacterImageUrl(userId, character.id).catch((error) => {
          console.warn("EVERBOND_SELECTED_CHARACTER_IMAGE_OPTIONAL_FAILED", {
            characterId: character.id,
            error:
              error instanceof Error
                ? error.message
                : "OPTIONAL_SELECTED_IMAGE_FAILED"
          });
          return null;
        })
      : null;`,
  "optional selected image isolation"
);

write(routePath, route);

const chatPath = "src/components/chat/LocalizedChatShell.tsx";
let chat = read(chatPath);

chat = replaceRequired(
  chat,
  `  if (language !== "EN" && (loading || !localized)) {
    return (
      <main className="flex h-[calc(100dvh-64px)] items-center justify-center px-4">
        <section className="w-full max-w-2xl rounded-[2rem] border border-bond-rose/35 bg-white/[0.035] p-8 text-center shadow-[0_0_34px_rgba(255,92,168,0.08)]">
          <p className={loading ? "animate-pulse text-bond-muted" : "text-bond-muted"}>
            {loading ? copy.translatingCharacter : copy.translationUnavailable}
          </p>
        </section>
      </main>
    );
  }

  return (
    <ChatShell
      key={\`\${character.id}:\${language}:\${character.tagline}\`}
      character={character}
    />
  );`,
  `  if (language !== "EN" && loading) {
    return (
      <main className="flex h-[calc(100dvh-64px)] items-center justify-center px-4">
        <section className="w-full max-w-2xl rounded-[2rem] border border-bond-rose/35 bg-white/[0.035] p-8 text-center shadow-[0_0_34px_rgba(255,92,168,0.08)]">
          <p className="animate-pulse text-bond-muted">
            {copy.translatingCharacter}
          </p>
        </section>
      </main>
    );
  }

  // EVERBOND_CHAT_INTRO_ENGLISH_FALLBACK
  const renderedCharacter =
    language !== "EN" && !localized ? baseCharacter : character;

  return (
    <ChatShell
      key={\`\${renderedCharacter.id}:\${language}:\${renderedCharacter.tagline}\`}
      character={renderedCharacter}
    />
  );`,
  "non-blocking chat intro fallback"
);

write(chatPath, chat);

const legacyPath = "src/app/api/characters-localized/route.ts";
let legacy = read(legacyPath);
legacy = replaceRequired(
  legacy,
  `    const characters = await localizeCharacters(
      result.characters,
      parsed.data.language as CharacterContentLanguage,
      { translateTags: true }
    );`,
  `    const characters = await localizeCharacters(
      result.characters,
      parsed.data.language as CharacterContentLanguage,
      { translateTags: true, allowProvider: false }
    );`,
  "legacy localized endpoint provider guard"
);
write(legacyPath, legacy);

if (!route.includes("EVERBOND_ZERO_COST_CHAT_INTRO_TRANSLATION")) {
  throw new Error("Selected route validation failed.");
}
if (!chat.includes("EVERBOND_CHAT_INTRO_ENGLISH_FALLBACK")) {
  throw new Error("Chat fallback validation failed.");
}
if (!legacy.includes("allowProvider: false")) {
  throw new Error("Legacy provider guard validation failed.");
}

console.log(
  "EVERBOND_ZERO_COST_CHAT_TRANSLATION discover=unchanged chat=intro-cache-first spanish=static-local fields=opening-scenario+first-message provider=off missing-es=local-fallback missing-other=english-fallback legacy-provider-route=off"
);
