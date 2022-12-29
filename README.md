Node.js loader for import specifiers as file paths without extensions or, optionally, as directory paths

&nbsp;

Install:
```
npm install extensionless
```

&nbsp;

Start `node` with the following flag added:
```
--experimental-loader=extensionless
```

&nbsp;

To configure this package, you can add the field `extensionless` to `package.json`:
```
"extensionless": {
  "lookFor": ["mjs", "js", "json"],  // default: ["js", "json"]
  "resolveDirs": true                // default: false
}
```
