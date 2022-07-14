# Adding a new tag type

All the data in a WISP tag is contained within it's EPC. This 96 byte value is treated as a 24 character, uppercase, hex string by the app.

```
              wispData           wispId
wispType ─┐   │                  │
          0B  01CE02000260000141 0042
```

In order to process `wispData`, the app looks for a definition in `tagDict.py` with a matching `wispType`. If one is found, the defined `parser` and `parserString` are used to add formatted versions of the data to the tag report.

`parser` and `parserString` should be defined as lambda functions that accept the 18 character `wispData`.

```python
defs = {
	'0B': {
        'name': 'Accelerometer',
        'parser': lambda d : accelParser(d),
        'parserString': lambda d : accelParserString(d),
    }
	...
}
```

Parser should return an object with `value`, `unit` and `label` fields. `parserString` should return a readable string representation of the data. 