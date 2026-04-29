// Pool de phrases motivantes — rotation quotidienne par catégorie + offset de page

export type MessageCategory = "deficit" | "surplus" | "overtime" | "complete" | "general"

interface MotivationalMessage {
  title: string
  body: string
}

const POOL: Record<MessageCategory, MotivationalMessage[]> = {
  deficit: [
    { title: "Quelques minutes à rattraper", body: "Rien d'insurmontable — le compteur rééquilibre naturellement avec les prochains postes." },
    { title: "Léger creux au compteur", body: "Il suffit d'un poste bien pointé pour commencer à remonter la pente." },
    { title: "Un pas à la fois", body: "Le déficit du compteur se résorbe tout seul en maintenant le rythme habituel." },
    { title: "Creux temporaire", body: "Quelques minutes à récupérer, c'est tout à fait dans l'ordre des choses." },
    { title: "Les compteurs ont parfois faim", body: "Il suffit d'un ou deux postes pour retrouver l'équilibre. On y est presque." },
    { title: "Pas d'inquiétude", body: "Ce petit déficit disparaîtra avec le prochain poste bien renseigné." },
    { title: "Le déficit, ombre de l'effort", body: "Il suffit de continuer à pointer pour que le solde repasse dans le vert." },
    { title: "Chaque poste comptera", body: "Le prochain poste pointé réduira ce déficit. C'est mécanique — et positif." },
    { title: "Un chiffre, pas plus", body: "Ce solde négatif ne dit rien de ton investissement réel. Continue." },
    { title: "Le rythme rattrapera", body: "Ton rythme naturel compensera ce petit écart sans même que tu t'en rendes compte." },
    { title: "Ce compteur te rend service", body: "Il garde la mémoire de chaque effort. Bientôt il sourira de nouveau." },
    { title: "Un creux, parfois ça vaut le coup", body: "Peut-être que tu as bien profité de ces jours-là. Ce n'est pas si mal." },
    { title: "La ligne verte revient", body: "Ce n'est qu'une question de postes. Elle reviendra, c'est garanti." },
    { title: "Quelques minutes de moins", body: "Quelques jours de plus à vivre pleinement. Ça vaut le creux." },
    { title: "Le travail se rattrape toujours", body: "Le temps perdu, lui, ne revient pas — alors autant l'avoir profité." },
    { title: "Ce n'est qu'un nombre", body: "Ton travail quotidien vaut infiniment plus que ces quelques minutes au compteur." },
    { title: "La constance efface tout", body: "Un solde négatif temporaire ne résiste pas à une semaine régulière." },
    { title: "Bientôt dans le vert", body: "Un poste à la fois, et ce sera beau. La progression est inévitable." },
    { title: "La respiration du planning", body: "Le creux du compteur, c'est juste le planning qui reprend son souffle." },
    { title: "Quelques minutes de dette", body: "Mais une motivation entière pour la semaine. Le compteur le sait." },
  ],

  surplus: [
    { title: "Beau solde compteur", body: "Tu travailles bien en avance — c'est une vraie force dans ton organisation." },
    { title: "Du temps en banque", body: "Ces minutes accumulées, c'est du temps libre que tu t'es offert sans le savoir." },
    { title: "Dans le vert, et de loin", body: "Beau travail de régularité. Tu peux regarder ce chiffre avec fierté." },
    { title: "Un généreux crédit", body: "Pense à planifier quelques récupérations — tu les mérites amplement." },
    { title: "Solde positif, humeur positive", body: "Continue comme ça. Ce rythme te laisse de la marge pour souffler." },
    { title: "Le temps, bien capitalisé", body: "Tu as des heures en banque. C'est précieux — pense à en profiter bientôt." },
    { title: "Ces heures t'appartiennent", body: "N'oublie pas de les récupérer. Elles attendent sagement dans le compteur." },
    { title: "Excellente avance", body: "Tu peux souffler un peu — le compteur te le permet. Profites-en." },
    { title: "Bien au-dessus de l'équilibre", body: "Signe de sérieux et de régularité. Le compteur le confirme clairement." },
    { title: "Le compteur déborde", body: "C'est l'heure de penser à toi — une récup s'impose à l'horizon." },
    { title: "Un coussin de confort", body: "Tu l'as bien mérité. Ce solde, c'est ta sécurité pour les mois à venir." },
    { title: "L'engagement dans les chiffres", body: "Ton compteur reflète fidèlement ton sérieux. C'est impressionnant." },
    { title: "Une liberté gagnée", body: "Ces heures d'avance, c'est de la liberté sur ton agenda futur." },
    { title: "Pense aux récupérations", body: "Ton solde le justifie largement. Une belle journée de récup est à portée." },
    { title: "Investissement bien placé", body: "Ces minutes supplémentaires, c'est ton engagement qui parle tout seul." },
    { title: "Bel excédent", body: "Il peut se transformer en journée de récupération. À toi de choisir quand." },
    { title: "La régularité récompensée", body: "Ton solde positif témoigne d'une constance que peu maintiennent. Bravo." },
    { title: "Un capital-temps bien construit", body: "Tu as su accumuler sans forcer. C'est la bonne approche." },
    { title: "L'avance, meilleure protection", body: "Avec ce solde, un imprévu ne te mettra pas en difficulté." },
    { title: "Tu as largement contribué", body: "Le compteur le sait, et il le retient fidèlement. Belle performance." },
  ],

  overtime: [
    { title: "Heures majorées ce mois", body: "Elles comptent double — au propre comme au figuré sur ta prochaine fiche." },
    { title: "Des supplémentaires bien notées", body: "Ces heures seront valorisées sur ton prochain bulletin de paie." },
    { title: "Effort supplémentaire reconnu", body: "Les heures supp de ce mois trouveront leur place dans ton brut." },
    { title: "Tu as donné plus que prévu", body: "La rémunération suit. Ces heures ne passeront pas inaperçues." },
    { title: "Chaque heure supp compte", body: "Elle s'ajoute directement à ton brut. Le moteur de calcul le sait." },
    { title: "La prime que tu t'es gagnée", body: "Ces heures majorées, c'est toi qui te l'as attribuée par ton travail." },
    { title: "Effort supplémentaire, salaire supplémentaire", body: "La logique est là — et le moteur de calcul applique les taux correctement." },
    { title: "Des heures en plus ce mois", body: "Elles ne seront pas oubliées — elles apparaîtront sur le bulletin." },
    { title: "Les bouchées doubles payent", body: "Ton engagement de ce mois se retrouvera sur ta fiche à venir." },
    { title: "Supplémentaires validées", body: "C'est bien noté. Le moteur de calcul applique les majorations en conséquence." },
    { title: "Engagement fort ce mois", body: "Les majorations sur ta fiche le prouveront — c'est mérité." },
    { title: "Ces heures de plus, ta reconnaissance financière", body: "Elle arrive avec le prochain bulletin. Patience." },
    { title: "L'investissement dépasse le contrat", body: "Les heures hors cadre se retrouveront dans ta rémunération." },
    { title: "La machine tourne à plein régime", body: "Et ton brut le reflète fidèlement. Bon mois pour la paie." },
    { title: "Heures supp, valeur ajoutée", body: "Ce que tu donnes en plus, tu le retrouves sur ta fiche. Simple et juste." },
  ],

  complete: [
    { title: "Mois bouclé", body: "Tous tes postes sont en place — tu peux consulter la synthèse l'esprit tranquille." },
    { title: "Tout est saisi", body: "Le moteur de calcul travaille sur des données complètes. Parfait." },
    { title: "Mois complet", body: "Beau travail de rigueur. Chaque journée est renseignée avec soin." },
    { title: "Tous tes postes pointés", body: "La synthèse mensuelle est prête à être consultée dans le détail." },
    { title: "C'est plié", body: "Le mois est entièrement renseigné. Plus qu'à attendre la fiche de paie." },
    { title: "Parfait — le mois est clôt", body: "Côté saisies, rien ne manque. Ton bulletin sera calculé sur des données complètes." },
    { title: "Tout est là", body: "Le moteur salaire a toutes les informations pour un calcul précis." },
    { title: "Zéro poste manquant", body: "On ne peut pas mieux faire. Félicitations pour cette rigueur." },
    { title: "Mois 100% saisi", body: "La synthèse finale attend ta visite. Elle sera complète et fiable." },
    { title: "Le travail de saisie est terminé", body: "Temps de souffler — tout est en ordre pour ce mois-ci." },
    { title: "Données complètes", body: "Le moteur de calcul peut travailler en toute confiance sur ce mois." },
    { title: "Mission accomplie", body: "Toutes les journées sont renseignées. La régularité paye." },
    { title: "Mois bouclé, habitude gagnante", body: "C'est une bonne habitude que tu as là — continue comme ça." },
    { title: "Toutes les journées dans les cases", body: "Sérieux et méthodique. Le mois est verrouillé." },
    { title: "Clôture parfaite", body: "Aucun poste ne manque à l'appel. Beau travail de suivi." },
  ],

  general: [
    { title: "Chaque poste pointé", body: "C'est un pas de plus vers un mois serein et un bulletin juste." },
    { title: "La régularité gagne", body: "C'est la meilleure des stratégies pour un suivi sans mauvaise surprise." },
    { title: "Quelques clics aujourd'hui", body: "Un bulletin juste demain. L'investissement est minime, le résultat fiable." },
    { title: "Le suivi fait la différence", body: "Continue comme ça — ton tableau de bord le reflète fidèlement." },
    { title: "Mois bien suivi, mois serein", body: "Aucune mauvaise surprise à la fin du mois grâce à ce suivi régulier." },
    { title: "La précision d'aujourd'hui", body: "C'est la tranquillité de demain. Chaque saisie compte dans le calcul final." },
    { title: "Tu maintiens le cap", body: "C'est tout ce qu'il faut. La cohérence dans la durée, c'est gagnant." },
    { title: "Valoriser son temps", body: "Renseigner ses postes, c'est donner de la valeur à chaque heure travaillée." },
    { title: "Petit à petit, le mois se construit", body: "Et à la fin, le bilan est fiable et sans accroc." },
    { title: "Un tableau de bord bien tenu", body: "C'est la promesse d'une fiche de paie sans mauvaise surprise." },
    { title: "Le travail qu'on pointe", body: "C'est le travail qu'on reçoit. La logique est implacable." },
    { title: "Chaque journée saisie compte", body: "Elle s'intègre dans le calcul final et construit le résultat mensuel." },
    { title: "Discipline et paie fiable", body: "Le suivi rigoureux se retrouve directement dans la précision du bulletin." },
    { title: "Au pilotage de son bilan", body: "Tu es aux commandes de ton propre tableau de bord mensuel." },
    { title: "Suivi soigné, bulletin sans accroc", body: "L'équation est simple — et ton application fait le reste." },
    { title: "La constance dans la saisie paie", body: "Au sens propre du terme. Continue comme ça." },
    { title: "Le compteur voit tout", body: "Il ne ment pas et il n'oublie rien. Un allié de taille." },
    { title: "Garder le fil de son temps", body: "C'est garder le contrôle sur son propre agenda professionnel." },
    { title: "Un mois bien tracé", body: "C'est un mois dont on peut être fier — et un bulletin qu'on peut relire sereinement." },
    { title: "Tu tiens ton bord", body: "C'est une qualité précieuse que peu de gens cultivent vraiment." },
    { title: "La clarté dans les chiffres", body: "Ça libère l'esprit. Moins de doutes, plus de confiance dans sa paie." },
    { title: "Un investissement sur soi-même", body: "Ce suivi régulier, c'est du temps gagné sur les incertitudes futures." },
    { title: "Pas à pas, une image précise", body: "Chaque saisie contribue à un portrait fidèle de ton mois de travail." },
    { title: "Pointer, c'est se respecter", body: "Valoriser ses heures avec précision, c'est prendre soin de soi." },
    { title: "Ton application fait le reste", body: "Toi, tu fournis les données — elle calcule, compare et présente." },
    { title: "La saisie du jour", body: "C'est la sérénité du lendemain. Quelques secondes bien investies." },
    { title: "Chaque entrée, une décision de rigueur", body: "Cette habitude-là se construit avec le temps et rapporte gros." },
    { title: "Tu pilotes ton mois comme un pro", body: "Le tableau de bord reflète une gestion sérieuse et régulière." },
    { title: "Le suivi, fondement d'un bulletin juste", body: "Sans lui, les calculs seraient des estimations. Avec lui, c'est de la précision." },
    { title: "Bien pointé, bien payé", body: "C'est aussi simple que ça — et ton application s'en charge pour toi." },
  ],
}

/** Retourne l'index du jour dans l'année (1-365) pour la rotation des messages */
function dayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000)
}

/**
 * Retourne un message rotatif selon la catégorie et un offset de page.
 * pageOffset (0-9) garantit que chaque page affiche un message différent le même jour.
 */
export function getMotivationalMessage(category: MessageCategory, pageOffset = 0): MotivationalMessage {
  const pool = POOL[category]
  const idx = (dayOfYear() + pageOffset * 7) % pool.length
  return pool[idx]
}

/**
 * Détermine la catégorie contextuelle à partir des données du compteur/mois.
 */
export function resolveCategory(params: {
  balanceMinutes: number
  overtimeMinutes: number
  workedCount: number
  totalDays: number
}): MessageCategory {
  const { balanceMinutes, overtimeMinutes, workedCount, totalDays } = params
  const remaining = totalDays - workedCount

  if (remaining === 0 && totalDays > 0) return "complete"
  if (balanceMinutes < -120) return "deficit"
  if (balanceMinutes > 240) return "surplus"
  if (overtimeMinutes > 60) return "overtime"
  return "general"
}
