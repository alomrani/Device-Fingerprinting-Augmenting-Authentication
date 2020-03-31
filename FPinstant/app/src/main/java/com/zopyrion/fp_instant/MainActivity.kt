package com.zopyrion.fp_instant

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Paint
import android.hardware.Sensor
import android.hardware.SensorManager
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.support.design.widget.FloatingActionButton
import android.widget.*
import android.text.method.ScrollingMovementMethod
import android.os.BatteryManager
import android.provider.Settings
import android.graphics.Point
import android.graphics.Typeface
import android.os.StrictMode
import io.github.rybalkinsd.kohttp.dsl.httpPost
import okhttp3.Response
import org.json.JSONObject


class MainActivity : AppCompatActivity() {

    private var debugMode = false;

    // Views
    private lateinit var username: EditText
    private lateinit var password: EditText
    private lateinit var login: Button
    private lateinit var register: TextView
    private lateinit var logger: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)

        initViews()

        register.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }

        login.setOnClickListener {
            if (username.text.isBlank() || password.text.isBlank()) {
                Toast.makeText(this, "Username or password is blank.", Toast.LENGTH_SHORT).show()
            } else {
                val response: Response = httpPost {
                    val u = username.text
                    val p = password.text

                    val fpMap = fingerprintDevice()

                    host = "192.168.1.11"
                    port = 3001
                    path = "/auth/login"

                    body {
                        json {
                            "username" to "$u"
                            "password" to  "$p"
                            "device_type" to "ANDROID"
                            "token" to "31e222baf22ab453f94e46db2d9905b16b9e81e2" // TODO add token field
                            "fingerprints" to json {
                                for ((key, value) in fpMap) {
                                    key to value.toString()
                                }
                            }
                        }
                    }
                }

                Toast.makeText(this, response.code().toString(), Toast.LENGTH_LONG).show()
            }
        }

        val checkFingerprints = findViewById<FloatingActionButton>(R.id.fbCheckFingerprints)

        checkFingerprints.setOnClickListener {
            if(debugMode){
                debugMode = false;
                username.visibility = EditText.VISIBLE
                password.visibility = EditText.VISIBLE
                login.visibility = EditText.VISIBLE
                logger.visibility = TextView.INVISIBLE
            } else {
                debugMode = true;
                username.visibility = EditText.INVISIBLE
                password.visibility = EditText.INVISIBLE
                login.visibility = EditText.INVISIBLE
                logger.visibility = TextView.VISIBLE
                logger.text = ""
            }
        }
    }

    private fun fingerprintDevice(): HashMap<String, HashMap<String, String>> {
        val fpMap = HashMap<String, HashMap<String, String>>()

        // Sensors
        val sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val deviceSensors: List<Sensor> = sensorManager.getSensorList(Sensor.TYPE_ALL)
        for(sensor in deviceSensors){
            val map = HashMap<String, String>()
            map["vendor"] = sensor.vendor
            map["version"] = sensor.version.toString()
            map["type"] = sensor.type.toString()
            map["resolution"] = sensor.resolution.toString()
            map["minDelay"] = sensor.minDelay.toString()
            map["power"] = sensor.power.toString()
            fpMap[sensor.name] = map
        }

        // Model
        val modelMap = HashMap<String, String>()
        modelMap["model"] = android.os.Build.MODEL
        modelMap["manufacturer"] = android.os.Build.MANUFACTURER
        modelMap["device"] = android.os.Build.DEVICE
        fpMap["model"] = modelMap

        // Operating system
        val osMap = HashMap<String, String>()
        osMap["board"] = android.os.Build.BOARD
        osMap["brand"] = android.os.Build.BRAND
        osMap["bootloader"] = android.os.Build.BOOTLOADER
        osMap["display"] = android.os.Build.DISPLAY
        osMap["product"] = android.os.Build.PRODUCT
        osMap["hardware"] = android.os.Build.HARDWARE
        osMap["id"] = android.os.Build.ID
        fpMap["os"] = osMap

        // Bluetooth
        val blueToothMap = HashMap<String, String>()
        blueToothMap["bluetoothName"] = Settings.Secure.getString(contentResolver, "bluetooth_name")
        fpMap["bluetoothName"] = blueToothMap

        // Display
        val display = windowManager.defaultDisplay
        val size = Point()
        display.getSize(size)
        val width = size.x
        val height = size.y
        val displayMap = HashMap<String, String>()
        displayMap["width"] = width.toString()
        displayMap["height"] = height.toString()
        fpMap["os"] = osMap

        // Virtual emulators
        val bm = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val batteryMap = HashMap<String, String>()
        batteryMap["level"] =  bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY).toString()
        fpMap["batteryPercentage"] = batteryMap


        return fpMap
    }

    private fun initViews(){
        username = findViewById(R.id.inputUsername)
        password = findViewById(R.id.inputPassword)
        login = findViewById(R.id.buttonLogin)
        register = findViewById(R.id.registerLink)
        register.setTextColor(Color.parseColor("#0000FF"))
        register.paintFlags = Paint.UNDERLINE_TEXT_FLAG
        register.setTypeface(null, Typeface.ITALIC)
        logger = findViewById(R.id.logger)
        logger.visibility = TextView.INVISIBLE
        logger.movementMethod = ScrollingMovementMethod()
    }

}
