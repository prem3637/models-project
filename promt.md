=== start Implementation ===

**Project Scope**
- we want to create admin dashboard panel where we handle RBC models. '
- The main functionality is to manage models data and their configurations like we have an module where we perform curd opertion of model data for example we have model name , age , height , weight , etc and some images of model. admin user can create delete update and view the module based on permissions.

- we want smart filter configure in list api like age , name , hieght based filter search.


**how we build**
- we use redux toolkit, mui , tailwind , react-hook form, zod, tanstack table these package need mandatory.
- we use react router for navigation.
- we use react query for data fetching.
- we use react hook form for form handling.
- we use zod for form validation.
- we use tanstack table for table handling.
- we use mui for ui components.
- we use tailwind for styling.
- we use redux toolkit for state management.
- we build the project component based pricipals we create component for every oeprtaion and action
- we have two diffrent layout for this on is black layout where we build the auth pages like login forget passowrd etc
- one we have layour for dashboard a sidebar and header.
- we impleement casl for role based access control. 
- we create a file for handlie navigrgtion route where we define all navigation routes. permissions of route. some route may be nasted or some may be direct route.
- navigation data conten wich navigoion data store in json format. which we show in dashboard sidebar.
- create this in typescript or with tsx file extension.
- create context api for ability
- create nested drawer component for open drawer from right to left

**current scope**
- we create mock data for handle this functionality.
- we create multiple components for handle this functionality.
- we create multiple pages for handle this functionality.
- we create some prebuild reusable components for handle this functionality. like form control components
- dropdown feature with search functionality
- button as well


Note: please follow the best practices and write clean, maintainable, and well-documented code. create proper folder structure and file structure. create an smart dashboard pannel for best user experience.