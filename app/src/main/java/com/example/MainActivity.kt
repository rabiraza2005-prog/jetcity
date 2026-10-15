package com.example

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Keep screen on during driving
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

    // Hide system bars for immersive sticky fullscreen
    val controller = WindowCompat.getInsetsController(window, window.decorView)
    controller.systemBarsBehavior =
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    controller.hide(WindowInsetsCompat.Type.systemBars())

    setContent {
      MyApplicationTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = androidx.compose.ui.graphics.Color(0xFF0F141C)
        ) {
          CarDriveGameScreen()
        }
      }
    }
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      val controller = WindowCompat.getInsetsController(window, window.decorView)
      controller.hide(WindowInsetsCompat.Type.systemBars())
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun CarDriveGameScreen() {
  val context = LocalContext.current
  var webViewRef by remember { mutableStateOf<WebView?>(null) }
  var isLoaded by remember { mutableStateOf(false) }
  var showExitDialog by remember { mutableStateOf(false) }

  // Handle system back button
  BackHandler {
    showExitDialog = true
  }

  Box(
      modifier = Modifier
          .fillMaxSize()
          .background(androidx.compose.ui.graphics.Color(0xFF0F141C))
  ) {
    // AndroidView hosting the WebGL 3D Driving Game
    AndroidView(
        factory = { ctx ->
          WebView(ctx).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0F141C"))

            // Let Android WebView manage hardware acceleration naturally without forcing offscreen render nodes
            settings.apply {
              javaScriptEnabled = true
              domStorageEnabled = true
              databaseEnabled = true
              allowFileAccess = true
              allowContentAccess = true
              useWideViewPort = true
              loadWithOverviewMode = true
              mediaPlaybackRequiresUserGesture = false
              cacheMode = WebSettings.LOAD_DEFAULT
            }

            webChromeClient = object : WebChromeClient() {
              override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                android.util.Log.d("CityDriveJS", "${consoleMessage?.message()} [line ${consoleMessage?.lineNumber()}]")
                return true
              }
            }

            webViewClient = object : WebViewClient() {
              override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                isLoaded = true
              }

              override fun shouldOverrideUrlLoading(
                  view: WebView?,
                  request: WebResourceRequest?
              ): Boolean {
                return false
              }
            }

            loadUrl("file:///android_asset/game/index.html")
            webViewRef = this
          }
        },
        modifier = Modifier
            .fillMaxSize()
            .testTag("game_web_view")
    )

    // Sleek minimal loading spinner
    if (!isLoaded) {
      Box(
          modifier = Modifier
              .fillMaxSize()
              .background(androidx.compose.ui.graphics.Color(0xFF0F141C)),
          contentAlignment = Alignment.Center
      ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
          CircularProgressIndicator(
              color = androidx.compose.ui.graphics.Color(0xFFE8684A),
              strokeWidth = 3.dp,
              modifier = Modifier.size(44.dp)
          )
          Spacer(modifier = Modifier.height(14.dp))
          Text(
              text = "Loading City Drive 3D...",
              color = androidx.compose.ui.graphics.Color.White,
              fontSize = 15.sp,
              style = MaterialTheme.typography.titleMedium
          )
        }
      }
    }

    // Exit Dialog
    if (showExitDialog) {
      AlertDialog(
          onDismissRequest = { showExitDialog = false },
          title = { Text(text = "Exit City Drive?") },
          text = { Text(text = "Your progress is automatically saved. Do you want to exit?") },
          confirmButton = {
            Button(
                onClick = {
                  showExitDialog = false
                  (context as? ComponentActivity)?.finish()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = androidx.compose.ui.graphics.Color(0xFFE8684A)
                ),
                modifier = Modifier.testTag("confirm_exit_button")
            ) {
              Text("Exit Game")
            }
          },
          dismissButton = {
            OutlinedButton(
                onClick = { showExitDialog = false },
                modifier = Modifier.testTag("cancel_exit_button")
            ) {
              Text("Continue Driving")
            }
          }
      )
    }
  }

  DisposableEffect(Unit) {
    onDispose {
      webViewRef?.destroy()
    }
  }
}
