# Interactive Particle and Keyword Visualization with p5.js

## Description

This project is an interactive visualization created using the p5.js library. It displays a main text (`"CMTB25"`) formed by thousands of particles. Additionally, various keywords move dynamically across the screen and interact with the particles and the main text. The keywords are repelled from the main text to avoid overlapping. Users can toggle different elements and capture a GIF recording of the animation.

## Features

- **Particle Animation**: Thousands of particles form the main text and move based on Perlin noise and other forces.
- **Keyword Movement**: Keywords move randomly and are repelled from the main text.
- **Interaction**: Users can toggle elements like the FPS counter, keywords, and main text.
- **GIF Recording**: Ability to record the animation as a GIF; the FPS counter is disabled during recording.
- **Customizable Parameters**: Many aspects of the animation can be adjusted by changing code parameters.

## Customization

You can tailor the code to your needs by adjusting the following parameters:

### Parameters

| Parameter                             | Description                                                     | Default Value            |
|---------------------------------------|-----------------------------------------------------------------|--------------------------|
| `canvasWidth`                         | Width of the canvas                                             | `1920`                   |
| `canvasHeight`                        | Height of the canvas                                            | `1080`                   |
| `MAIN_TEXT`                           | The main text displayed                                         | `"CMTB25"`               |
| `KEYWORDS`                            | Array of keywords to display                                    | See code for list        |
| `PARTICLE_COUNT`                      | Number of particles to display                                  | `5000`                   |
| `TXT_SIZE`                            | Size of the main text (computed based on canvas height)         | `canvasHeight * 0.3`     |
| `KEYWORD_SIZE`                        | Size of the keywords (computed based on canvas height)          | `canvasHeight * 0.05`    |
| `NOISE_SCALE`                         | Scale of the noise function                                     | `0.05 * canvasWidth`     |
| `KEYWORD_ATTRACTION_FORCE`            | Attraction force of particles towards keywords                  | `canvasWidth * 0.05`     |
| `MAX_SPEED`                           | Maximum speed of particles                                      | `canvasWidth * 0.01`     |
| `INITIAL_SPEED`                       | Initial speed of particles                                      | `canvasWidth * 0.005`    |
| `PARTICLE_SIZE_MIN`                   | Minimum size of particles                                       | `canvasWidth * 0.01`     |
| `PARTICLE_SIZE_MAX`                   | Maximum size of particles                                       | `canvasWidth * 0.05`     |
| `DISTANCE_THRESHOLD`                  | Distance threshold for particle interactions                    | `canvasWidth * 0.005`    |
| `MOUSE_REPULSION_FORCE`               | Repulsion force from the mouse cursor                           | `canvasWidth * 0.5`      |
| `MOUSE_REPULSION_RADIUS`              | Radius around the mouse where repulsion is effective            | `canvasWidth * 0.05`     |
| `KEYWORD_DRIFT_SPEED`                 | Drift speed of keywords                                         | `canvasWidth * 0.005`    |
| `NOISE_FORCE_MAGNITUDE`               | Magnitude of the noise force                                    | `canvasWidth * 0.1`      |
| `LIFETIME_MIN`                        | Minimum lifetime of particles (in seconds)                      | `5`                      |
| `LIFETIME_MAX`                        | Maximum lifetime of particles (in seconds)                      | `30`                     |
| `TIME_INCREMENT`                      | Time increment for noise animation                              | `1`                      |
| `BACKGROUND_FADE`                     | Fade amount for the background (for trail effect)               | `4`                      |
| `KEYWORD_REPULSION_FORCE`             | Repulsion force of keywords from the main text                  | `canvasWidth * 0.1`      |
| `KEYWORD_REPULSION_RADIUS_MULTIPLIER` | Multiplier for the repulsion radius around the main text        | `1.5`                    |
| `BLUR_LEVELS`                         | Array of blur levels for keywords                               | `[3, 2, 1, 0]`           |
| `Z_MIN`                               | Minimum z-value for keyword depth effect                        | `-50`                    |
| `Z_MAX`                               | Maximum z-value for keyword depth effect                        | `50`                     |
| `showFPS`                             | Boolean to show/hide FPS counter                                | `true`                   |
| `showWords`                           | Boolean to show/hide keywords                                   | `true`                   |
| `showMainText`                        | Boolean to show/hide the main text                              | `true`                   |

### How to Change Parameters

- **In Code**: Most parameters are calculated in the `computeSizesAndScales()` function. You can adjust them directly in the code.
- **Customization**: Experiment with different values to achieve various visual effects. For example, increasing `PARTICLE_COUNT` will add more particles, but may affect performance.

## Controls

You can interact with the visualization using the following keyboard shortcuts:

| Key   | Action                                                                                |
|-------|---------------------------------------------------------------------------------------|
| **S** | Save a screenshot of the current state with a timestamp                               |
| **W** | Toggle keywords on/off                                                                |
| **F** | Toggle FPS counter on/off                                                             |
| **T** | Toggle main text on/off                                                               |
| **G** | Start or stop GIF recording. The FPS counter is disabled during recording             |

- **Note**: During GIF recording, the FPS counter is automatically disabled.

## Dependencies

- **p5.js**: Main library for visualization.
- **Orbitron-Regular.ttf**: Font used for text rendering.
- **gif.js**: Library for creating GIFs.

## Notes

- **Performance**: A high number of particles may affect performance. Reduce `PARTICLE_COUNT` if necessary.
- **Blur Effects**: The blur values in `BLUR_LEVELS` may need adjustment based on resolution.
- **Interaction**: Particles respond to mouse position when the cursor is over the canvas.
- **Physics Customization**: Experiment with the physical parameters to achieve different visual effects.

## Contact

Feel free to reach out if you have any questions or suggestions.

---

Enjoy experimenting with the interactive visualization!