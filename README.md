# Translation Project

## Features

## Routing

METHOD PATH PAGE DESCRIPTION
HOME:
| GET |/ | home | Home Page

AUTHENTICATION:
| GET |/authentication/sign-up | authentication/sign-up | Sign Up Form  
| POST |/authentication/sign-up | authentication/sign-up | User submits form, redirected to authentication/sign-in  
| GET |/authentication/sign-in | authentication/sign-in | Sign In Form  
| POST |/authentication/sign-in | authentication/sign-in | User submits form, redirected to /profile/:id
| POST |/authentication/sign-out | / | User signs out, redirected to /

PROFILE:
| GET |/profile/:id | profile | User directed to personal profile page

PROJECT:
| GET |/project/create | project/create | User directed to create a new project form (Step 1)
| POST |/project/create | project/confirmation | User directed to a page with a "add texts to the project" link
| GET |/project/:id/add | project/edit| Add German Texts Form
| POST |/project/:id/add | project/edit| Add German Texts Form
| GET |/project/:id | project/showtexts| Shows submitted German texts with edit text and CSV export buttons. Includes input fields for English and French Text edit and CSV import buttons.
| POST |/project/:id| project/edit| Show German Texts Form ????
| POST |/project/:id/ongoing| project/showtexts| Redirected to /project/:id and shows ongoing status
| POST |/project/:id/completed| project/showtexts| Redirected to /project/:id and shows completed status
| GET |/project/:id/edit | project/edit| Shows form for editing submitted text and allows for new text blocks to be added
| POST |/project/:id/edit | project/edit| Redirects to /project/:id and shows submitted German texts with edit text and CSV export buttons. Includes input fields for English and French Text edit and CSV import buttons.
| POST |/project/:id/exportgermancsv| project/showtexts| Redirected to /project/:id and exports German text CSV file
| POST |/project/:id/csv-file-upload| project/showtexts| Redirected to /project/:id and imports English text CSV file
| GET |/project/:id/edit/english | project/editenglish| Shows form for editing English text
| POST|/project/:id/edit/english | project/editenglish| Redirects to /project/:id and shows submitted German texts with edit text and CSV export buttons. Includes input fields for English and French Text edit and CSV import buttons.
| GET |/project/:id/delete | project/delete | User directed to a delete project confirmation page
| POST |/project/:id/delete | project/delete | User redirected to /project/all

| GET |/project/all | project/index | User directed to a complete project list
