"use client" ;

import React from  "react" ;
import { Container, Paper, Typography, Box, Divider } from  "@mui/material" ;

export default function MentionsLegalesPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color:  "#031c38"  }}>
          Mentions Légales
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display:  "flex" , flexDirection:  "column" , gap: 3, mt: 3 }}>
          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              1. Éditeur de l application
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <strong>Nom du projet :</strong> Fishkeeper<br />
              <strong>Responsable de publication :</strong> Équipe Projet Fishkeeper<br />
              <strong>E-mail :</strong> contact@fishkeeper.local
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              2. Hébergement
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <strong>Hébergeur :</strong> Vercel Inc.<br />
              <strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
              <strong>Site web :</strong> https://vercel.com
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              3. Propriété intellectuelle
            </Typography>
            <Typography variant="body2" color="text.secondary" >
              L ensemble de cette application relève de la législation française et internationale sur le droit d auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.
            </Typography>
          </section>

          <section>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              4. Contact
            </Typography>
            <Typography variant="body2" color="text.secondary" >
              Pour toute question relative au fonctionnement du site ou à l exercice de vos droits sur vos données, vous pouvez contacter l équipe via l adresse e-mail mentionnée ci-dessus.
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
}