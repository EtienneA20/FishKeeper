 "use client" ;

import React from  "react" ;
import { Container, Paper, Typography, Box, Divider } from  "@mui/material" ;

export default function CGUPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color:  "#031c38"  }}>
          Conditions Générales d Utilisation (CGU)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          Dernière mise à jour : 13 octobre 2026
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display:  "flex" , flexDirection:  "column" , gap: 3, mt: 3 }}>
          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              1. Objet
            </Typography>
            <Typography variant="body2" color="text.secondary" >
              Les présentes Conditions Générales d Utilisation ont pour objet de définir les modalités et conditions d accès et d utilisation de l application <strong>Fishkeeper</strong>.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              2. Accès au service
            </Typography>
            <Typography variant="body2" color="text.secondary" >
              L application permet à l utilisateur de suivre la gestion de ses aquariums (paramètres d eau, faune, flore, maintenance et matériel). L accès au service est gratuit et ouvert à tout utilisateur disposant d un accès à Internet.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              3. Propriété intellectuelle
            </Typography>
            <Typography variant="body2" color="text.secondary" >
              L ensemble des éléments de l application (textes, graphismes, logos, icônes, code source) est la propriété exclusive de l éditeur de Fishkeeper. Toute reproduction, modification ou distribution non autorisée est strictement interdite.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              4. Gestion des données personnelles
            </Typography>
            <Typography variant="body2" color="text.secondary" >
              Les données saisies au sein de l application sont enregistrées afin d assurer le suivi de vos bacs. Conformément au RGPD, vous disposez d un droit d accès, de rectification et de suppression de vos données.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              5. Limite de responsabilité
            </Typography>
            <Typography variant="body2" color="text.secondary" >
              Fishkeeper est un outil d aide et de suivi aquariophile. L éditeur ne peut être tenu responsable d un éventuel dysfonctionnement, de pertes d espèces vivantes ou d erreurs d interprétation des données.
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
}