#Connect to database and CRUD functions
#Need to pip install psycopg2, sqlalchemy
import psycopg2
from sqlalchemy import create_engine
import csv
from dotenv import load_dotenv
import os


# set up DB .env var
db_user = os.getenv("PG_USER")
db_password = os.getenv("PASSWORD")
db_host = os.getenv("PG_HOST")
db_port = os.getenv("PORT")
db_name = os.getenv("DB_NAME")
db_schema = os.getenv("DB_SCHEMA")
db_table = os.getenv("DB_TABLE")

#function to create a connection instance to database
def connect():
    try:
        connection = psycopg2.connect(
            user = db_user,
            password = db_password,
            host = db_host,
            port = db_port,
            database = db_name
        )
        return connection
    
    except (Exception, psycopg2.Error) as error:
        print("Wrong credentials for database in connect()!", error)


#function to READ data from the database
def read():
    try:
        connection = connect()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM a.jsondata")

        # fetched_data = cursor.fetchone()
        fetched_data = cursor.fetchall()    #fetch all data in the database
        # print(fetched_data)

        connection.commit()
        cursor.close()
        connection.close()

        return fetched_data
    except (Exception, psycopg2.Error) as error:
        print("Unable to read from database in read()!", error)

#write the df to sql
def write_df(schemata, table, df):
    try:
        #set up engine
        engine_url = 'postgresql://udopt:udopt@3.0.184.200:5432/udopt_db'
        with create_engine(engine_url).connect() as engine:
            #write
            df.to_sql(name=table, schema=schemata, con=engine, if_exists='append', index=False)

    except (Exception) as error:
        print(error)


#############################################################################################################
#Create a schema and table, just need to run once, not important, use in jupyter notebook when needed
#UNCOMMENT TO CREATE NEW TABLE
##Modify this to create diff tables

def create_temp_schema_and_table():
    try:
        connection = psycopg2.connect(
            user = db_user,
            password = db_password,
            host = db_host,
            port = db_port,
            database = db_name
        )

        cursor = connection.cursor()
        # cursor.execute("CREATE SCHEMA TemporaryData")
        cursor.execute("""
            CREATE TABLE TemporaryData.module_b_data(
                "Session_ID" UUID NOT NULL,
                "Timestamp" TIMESTAMPTZ,
                "Gen" VARCHAR(255),
                "Pop" VARCHAR(255),
                "BKeyXScale" VARCHAR(255),
                "BKeyYScale" VARCHAR(255),
                "GridAngle" VARCHAR(255),
                "GridSpacing" VARCHAR(255),
                "ParcelStoreyScale" VARCHAR(255),
                "TotalViewObstruction" VARCHAR(255),
                "MeanEWAspectRatio" VARCHAR(255),
                "CV" VARCHAR(255),
                "Archive" jsonb
             )
        """)

        connection.commit()

        connection.close()
        cursor.close()
    
    except (Exception, psycopg2.Error) as error:
        print(error)
