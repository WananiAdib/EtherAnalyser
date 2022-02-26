# EtherAnalyser

EtherAnalyser is a REST API to access information about the current gas prices at different tiers as well as the averge over a certain period.

## Runing the API

Before starting, you should retrieve your API Key from [EtherScan](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics), and add it in place of config.apiKeyToken

On your terminal, run this when you want to start the API

```bash
docker-compose up
```

And when you're done with it click on Ctrl+C, and run

```bash
docker-compose down
```

## API Endpoints

### GET Gas Price

You can access the current gas price for different tiers, in Gwei, in the following link
```
localhost:3000/gas
```

the following returns a JSON object similar to the following

```
{   
    "error":false,
    "message":{
        "fast":22,
        "average":21,
        "low":21,
        "blockNum":14279644
    }
}
```

### GET Average Gas Price

You can access the average gas price for different tiers between two timestamps, in Gwei, in the following link
```
http://localhost:3000/average?fromTime=&toTime=
```
where you would input after the equal signs the time in UNIX format. Example
```
http://localhost:3000/average?fromTime=1645851190&toTime=1645851206
```

the following returns a JSON object similar to the following

```
{   
    "error":false,
    "message":{
        "fast":"22.5484",
        "average":"21.7742",
        "low":"20.7742"
    }
}
```

## Methods and Choices

For this project, I have used node.js and express.js to build a REST API. When the server starts, it automaticaly starts quering from EtherScan's Api and storing it into a MySql database, this comes handy later when we need to access the average. For GET gas, I use the query function from mysql to get the last input on the table. For GET average, I use AVG() function to retrieve the averages. Please have a look at the anotated code.

Things that I need to improve on:
    - Error handling, sometimes EtherScan's API returns undefined json objects.
    - Query clients API Token from the link, rather than making them write theirs in the code.
