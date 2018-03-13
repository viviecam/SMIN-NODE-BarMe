# SMIN-NODE-BarMe


- Gérer la possibilité pour l'utilisateur de modifier le prix de la pinte de bière : 
stocker chaque prix un tableau de variable ?
prix[]
index : prix[idplace]
publier changement via socket io
formulaire avec récupération de la valeur du champ, comme dans le message du chat


- Géolocalisation
Définir une zone autour du bar. Si les coordonées de l'user son dans cet zone, alors augmenter le taux d'occupation du bar
tauxOccupation[] 
index : tauxOccuaption[idplace]

Fonction qui met à jour le taux d'occupation en fonction de la position des users, à rappeler toutes les 10 mins ? 