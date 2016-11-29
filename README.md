# MagicMirror Module: MMM-Tado-ThermoStats
A MagicMirror Module for displaying your Tado Thermostat data.

## Example

![](example.png) ![](example2.png)

### The module displays the current temperature, the set temperature and hopefully in the future a symbol for if your heating is enabled or not:

## Installation

In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/olipayne/MMM-Tado-ThermoStats.git tado
````

Configure the module in your `config/config.js` file.

## Updating the module

If you want to update your MMM-Tado-ThermoStats module to the latest version, use your terminal to go to your tado module folder and type the following command:

````
git pull
```` 

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
                    {
                        module: 'tado',
                        position: 'bottom_right',
                        config: {
                                tado_username: 'your@email.com',
                                tado_password: 'youPassword',
                                tado_home_number: 'yourHomeNumber',
                                tado_zone_number: 'yourZoneNumber',
                        }
                },
]
````

## Configuration options

The following properties need to be configured:


<table width="100%">
    <!-- why, markdown... -->
    <thead>
        <tr>
            <th>Option</th>
            <th width="100%">Description</th>
        </tr>
    <thead>
    <tbody>

        <tr>
            <td><code>tado_username</code></td>
            <td><b>Required</b> - Your Tado account username.</td>
        </tr>
        <tr>
            <td><code>tado_password</code></td>
            <td><b>Required</b> - Your Tado account password.</td>
        </tr>
        <tr>
            <td><code>tado_home_number</code></td>
            <td><b>Required</b> - This is your Tado home ID number. You can find this out a number of ways, the easiest is to run the scrit here https://raw.githubusercontent.com/olipayne/MMM-Tado-ThermoStats/master/findHomeID.sh again changing your username and password.<br>
            </td>
        </tr>
        <tr>
            <td><code>tado_zone_number</code></td>
            <td><b>Required</b> - This is your Tado zone ID number. I only have a single zone so a little unsure of this, but for people with a single Tado device we can assume this to be 1.<br>
            </td>
        </tr>
    </tbody>
</table>

I know the script is maybe not the nicest way to get the homeid, maybe sometime I will look into the module actually grabing this as well.
