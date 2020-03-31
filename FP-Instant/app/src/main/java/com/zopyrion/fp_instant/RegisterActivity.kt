package com.zopyrion.fp_instant

import android.content.Context
import android.graphics.Point
import android.hardware.Sensor
import android.hardware.SensorManager
import android.os.BatteryManager
import android.os.Bundle
import android.provider.Settings
import android.support.v7.app.AppCompatActivity;
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import io.github.rybalkinsd.kohttp.dsl.httpPost

import okhttp3.Response
import org.json.JSONObject
import com.google.gson.GsonBuilder
import com.google.gson.Gson



class RegisterActivity : AppCompatActivity() {

    private lateinit var username: EditText
    private lateinit var password: EditText
    private lateinit var email: EditText
    private lateinit var register: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        username = findViewById(R.id.registerUsername)
        password = findViewById(R.id.registerPassword)
        email = findViewById(R.id.registerEmail)
        register = findViewById(R.id.registerButton)




        register.setOnClickListener {
            if (username.text.isBlank() || password.text.isBlank()) {
                Toast.makeText(this, "Username or password is blank.", Toast.LENGTH_SHORT).show()
            } else {
                val response: Response = httpPost {
                    val u = username.text
                    val p = password.text

                    val fpMap = fingerprintDevice()

                    host = "192.168.1.11"
                    port = 3001
                    path = "/auth/register"

                    body {
                        json {
                            "username" to "$u"
                            "password" to  "$p"
                            "device_type" to "ANDROID"
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

}
