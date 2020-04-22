# anti-robot

A robot-like behaviour detection tool.


## Getting Started

### Installing

Copy `/build/anti-robot.min.js`

Or, install via npm:

`npm install anti-robot`

### Importing

```html
<script type="text/javascript" src="./anti-robot.min.js"></script>
<script>
    AntiRobot.detectRobot(function(code, info) {
      // some code to handle it
    });
</script>
```

Or, if you installed via npm:

```js
import { AntiRobot } from 'anti-robot';

AntiRobot.detectRobot((code, info) => {
  // some code to handle it
});
```


## Documentation

### detectRobot()

Turn on robot-like behaviour detection. 

**Syntax:**

```js
AntiRobot.detectRobot(handler [, signOpts, threshold]);
```

**Parameters:**

*handler* - Callback function which receive a notification (the code and the object with event target) when a robot-like behaviour is detected. See [The robot handler](#The-robot-handler) for details on the callback itself.

*signOpts* [optional] - An options object helps to generate the signature. Signature is to identify the page is reloaded / redirected or not.

*threshold* [optional] - The time interval of the last five click events, also the time interval between the last mouse move event and the last click event during the robot-like behaviour evaluation. Default is 10000ms. The unit is millisecond.

### checkSignature()

Check current signature is the same as the original or not.

**Syntax:**

```js
AntiRobot.checkSignature([signOpts]);
```

**Parameters:**

*signOpts* [optional] - An options object helps to generate the signature. Signature is to identify the page is reloaded / redirected or not.

**Return:**

result - boolean, true is the same, otherwise false.

### reset()

reset the signature, handler and threshold.

**Syntax:**

```js
AntiRobot.reset();
```


## Usage notes

### The robot handler

**Syntax:**

```js
function robotHandler(code, info) {
  switch (code) {
    case 1: {
      // handle robot UA
      break;
    }
    case 2: {
      // handle click without mouse movement 
      break;
    }
    case 3: {
      // handle fake click
      break;
    }
  }
}
```

**Parameters:**

*code* - The code presents the rule of the robot-like behaviour evaluation. 

> 1 - user agent contains suspect robot keyword.
> 
> 2 - triggers click event without mouse movement in the latest short period.
> 
> 3 - triggers click event without local coordinates of the mouse pointer.

*info* - An object based on `click` event description

## Compatibility

### Desktop

- Edge 50 and above
- Firefox 50 and above
- Chrome 45 and above
- Safari 12 and above
- Opera 50 and above

**NOT** supports IE !!!

### Mobile Device

**TODO**

