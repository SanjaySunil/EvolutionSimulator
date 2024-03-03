# System Objectives

**Create a user-friendly interface that allows the user to create a new simulation, import a simulation, reset a simulation, and open a controls menu which displays real-time simulation statistics.**
- Build the simulation web interface using HTML and CSS.
- Bind event listeners to the buttons in the simulation web interface which perform the necessary actions.
- Display real-time simulation statistics in the controls menu.

**Develop a grid-based environment in which organisms can roam and occupy grid cells, and grid cells can also have wall and radioactive states.**
- A 2D grid should be created when the Grid class is instantiated and the grid must always be square.
- The grid must be composed of instances of the class GridCell, where each grid cell can only have one of four states: empty, wall, food or radioactive.

**Allow the user to download an individual organism’s neural network diagram upon mouse selection and display the best fitness of the selected organism.**
- Upon selection, the program must check to see if an organism has been selected and if so, display the selected organism section in the controls menu which contains a button to download the neural network diagram and a label to display the current fitness of the selected organism.
- An event listener must be bound to the download button which downloads the neural network diagram of the selected organism onto the user's device, and it must be in the form of a .svg file.
- The download neural network diagram function should read the brain wiring of the organism and use this information to build the neural network diagram using SVG.

**Create an export feature allowing users to save organisms in a simulation, simulation environments, simulation configuration files and entire simulations.**
- The four export buttons must be bound to event listeners which call the necessary functions to export the required data.
- When the export is complete, the export feature should download the exported data onto the user's computer in the form of a .json file.

**Create an import feature allowing users to import organisms, simulation environments, simulation configuration files and entire simulations.**
- The four import buttons must be bound to event listeners which call the necessary functions to import the required data.
- The import feature should allow the user to select a .json file from their computer, validate the file to ensure it is in the correct format and notify the user whether the import was successful or not.
- If the import was successful, the imported data should be used to replace the current data in the simulation and should take effect immediately.

**Create a dynamic simulation settings page in the controls menu, allowing the user to change the simulation settings in real-time.**
- The program should store the simulation configuration so that it can be updated and accessed anywhere in the program.
- The simulation settings page should contain input fields for the user to change the simulation settings.
- The input fields should be bound to event listeners which call the necessary functions to change the simulation settings in real-time.
- The program should prevent specific settings that cannot be changed in real-time from being changed and alert the user if they try to change these settings.
- The program should validate the user's input to ensure it is within the correct range and alert the user if it is not.

**Create an environment navigation system, enabling the user to explore the simulation environment whilst the simulation is running.**
- The user should be able to pan incremently in any direction using the arrow keys on the keyboard and zoom in and out using the mouse wheel in IDLE mode.
- The user should also be able to pan using the mouse freely in PAN mode.

**Provide the ability to add walls and radioactive barriers that impact the movement strategies of organisms and allow the user to remove them as well.**
- The user should be able to add walls and radioactive barriers to the grid by clicking on a grid cell with the correct mouse mode selected.
- The user should also be able to remove walls and radioactive barriers from the grid by clicking on a grid cell with the correct mouse mode selected.
- The program should prevent the user from adding walls and radioactive barriers to grid cells that are already occupied by an organism.
- Walls should block the movement of organisms and radioactive barriers should kill organisms that move onto them.

**Create a simulation statistical analysis feature that allows the user to view statistical graphs showing the effect of different simulation variables against the number of generations.**
- The user should be able to choose a variable to analyse from a dropdown menu in the controls menu, which include the best fitness, average fitness and number of species against the number of generations.

**Create an algorithm to calculate an organism's genetic phenotype (colour) using its genome.**
- The program should calculate the colour of an organism based on its genome and display the colour of the organism in the simulation environment.
- The program should return the same colour for the same genome and should return a different colour for a different genome.

**Create a simulation engine that iterates through a population of organisms, and execute their neural network decisions and a rendering engine to display the simulation environment in real-time.**
- The simulation engine should use two simultaneous loops, which are handled at two specified frame rates.
- If the update engine is able to perform updates faster than the specified update fps rate, then the update engine should also perform the rendering tasks.
- If the update engine is unable to perform updates faster than the specified update fps rate, then the rendering engine should perform it's tasks at the specified render fps rate.
- The update engine should calculate and execute each organism's neural network decisions.
- The rendering engine should contiually check the rendering queue to see if any cells need to be filled or cleared.

**Create a genetic algorithm that evolves a population of organisms over geenerations, aiming to improve fitness results and reduce the number of species.**
- The genetic algorithm should perform selection and crossover on the population of organisms to create a new population of organisms with combined genes from their parents.
- The genetic algorithm should perform mutation on the new population of organisms to introduce new genes into the population.

**Create a fitness function that evaluates the performance of an organism and assigns a fitness score based on the performance.**
- Two fitness functions should be created, where the user can choose which fitness function to use in the simulation settings.
- The food fitness function should evaluate the performance of an organism based on the amount of food to fill its energy store.
- The coordinate fitness function should evaluate the performance of the organism by calculating how close the organism is to any selected target coordinates.
- When an organism is selected in the simulation environment, the fitness score of the organism should be displayed in the selected organism section of the controls menu.

**Allow the user to choose the zone that optimises the coordinate fitness function to show that the organisms are evolving to the best possible fitness.**
- The user should be able to select multiple goal coordinates by selecting a grid cell in the simulation environment with the goal mouse mode selected.
- The user should be able to remove goal coordinates by selecting a grid cell in the simulation environment with the goal mouse mode selected.
- The user should be alerted if a goal coordinate has not been selected if the user tries to run the simulation with the coordinate fitness function selected.

**Create sensors for each organism that allow them to obtain information about their environment and use this information to make decisions.**
- A sensor should be created that mimics biological eyes and allows the organism to see the state of a grid cell in a specific direction.
- A sensor should be created that allows the user to identify where the organism is in the grid relative to specific places in the grid.
- Data returned from the sensors should be fed into the neural network brain of the organism to make decisions.

**Create a genome for each organism that stores genetic information on the neural network brain of the organism.**
- The genome should store information that can be used to build the neural network brain of the organism.
- Random genomes should be created for the initial population of organisms.
- The genome should be in a suitable format to be used in the genetic algorithm.

**Create a neural network brain for each organism using its genome.**

**Use the neural network brain for each organism to compute their decisions and actions for each iteration of the simulation.**
- The neural network brain should compute a position vector which is used to move the organism in the simulation environment.
- The organism should be rotated to face the direction in which it is moving, so that when the organism's biological eyes are used, the organism can see in the direction it is facing.

**Allow the user to change the update/render fps rate and also be able to enable/disable the rendering engine to improve simulation performance when needed in real-time.**

**Create an obstruction generation feature that allows the user to generate walls randomly in the simulation environment.**
- The user should be able to generate walls randomly in the simulation environment by clicking the generate walls button in the controls menu.
- The user should be able to remove all walls from the simulation environment by clicking the remove walls button in the controls menu.
