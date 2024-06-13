#include "LoadingScene.h"
#include "AppDelegate.h"
#include "ScriptingCore.h"
#include "update/NativeBridge.h"
#include "update/DialogUI.h"
#include "update/CCLocalizedString.h"
#include "baseframework/BaseFramework.h"
#include "storage/local-storage/LocalStorage.h"
#include "cocos2d.h"
#include "ide-support/CodeIDESupport.h"

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
#include <jni.h>
#include "platform/android/jni/JniHelper.h"
#include "platform/CCCommon.h"
#elif(CC_TARGET_PLATFORM == CC_PLATFORM_IOS)

#else
#endif

using namespace CocosDenshion;

#if (COCOS2D_DEBUG > 0) && (CC_CODE_IDE_DEBUG_SUPPORT > 0)
#include "runtime/Runtime.h"
#include "ide-support/RuntimeJsImpl.h"
#else
#include "js_module_register.h"
#endif

// function
void closeGame()
{
#if CC_TARGET_PLATFORM == CC_PLATFORM_IOS
	exit(0);
#else
	Director::getInstance()->end();
#endif
}

// LOADING
LoadingGUI *LoadingGUI::_inst = NULL;

void LoadingGUI::initUI()
{
	cocos2d::log("__INIT__GUI__LOADING___");
	auto size = Director::getInstance()->getWinSize();
	float _scale = size.width / 1200;
	_scale = (_scale > 1) ? 1 : _scale;

	// BG LOADING
    auto bg = Sprite::create("res/APK/Loading/bg.png");
    bg->setScaleX(size.width / bg->getContentSize().width);
    bg->setScaleY(size.height / bg->getContentSize().height);
    addChild(bg);
    bg->setPosition(size.width / 2, size.height / 2);

    // TEXT LOADING
    lbVersion = Text::create("1.0","res/APK/font_content.ttf",25);
    lbVersion->setTextHorizontalAlignment(TextHAlignment::LEFT);
    lbVersion->setTextColor(Color4B(203, 204, 206, 255));
    lbVersion->setAnchorPoint(Vec2(0, 0.5));
    addChild(lbVersion);
    lbVersion->setScale(_scale);
    lbVersion->setPosition(Vec2(10, lbVersion->getContentSize().height));

    lbUpdate = Text::create("Loading", "res/APK/font_content.ttf", 25);
    lbUpdate->setTextHorizontalAlignment(TextHAlignment::CENTER);
    lbUpdate->setTextColor(Color4B(203, 204, 206, 255));
    lbUpdate->setAnchorPoint(Vec2(0.5, 0.5));
    addChild(lbUpdate);
    lbUpdate->setScale(_scale);
    lbUpdate->setPosition(Vec2(size.width/2, lbUpdate->getContentSize().height));

	// init storage
	std::string strFilePath = cocos2d::FileUtils::getInstance()->getWritablePath();
	strFilePath += "/jsb.sqlite";
	localStorageInit(strFilePath.c_str());

	// start
	cocos2d::log(">> Start Game");
	lbUpdate->setString("Start Game");
	checkNoNetwork();
}

void LoadingGUI::initDownloader()
{
	std::string storagePath = fr::NativeService::getFolderUpdateAssets();

    std::string manifestFile = "project.manifest";
#if(CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    	manifestFile = "project.dat";
#endif
	_am = AssetsManagerEx::create(manifestFile, storagePath);
	_am->retain();

	onLoadJSVersion();
}

void LoadingGUI::checkNewAPK()	{
	cocos2d::log("____CHECK___NEW___APK_____");

	lbUpdate->setString("Check Version");

	string currentversioncode = NativeBridge::getVersionCode();
	string versioncode = "";
	localStorageGetItem("versioncode", &versioncode);

	cocos2d::log("__APP__VERSION___%s vs %s",currentversioncode.c_str(),versioncode.c_str());
	if (versioncode == "")
	{
		localStorageSetItem("versioncode", currentversioncode);
	}
	else
	{
		if (currentversioncode != versioncode)
		{
			localStorageSetItem("versioncode", currentversioncode);
			std::string storagePath = fr::NativeService::getFolderUpdateAssets();
			unsigned long found = storagePath.find_last_of("/\\");
			if (found < storagePath.length() - 1)
			{
				storagePath += "/";
			}

			if (FileUtils::getInstance()->removeDirectory(storagePath))
			{
				cocos2d::log("_____DELETE___UPDATE___FOLDER___SUCCESS__________");
			}
			else
			{
				cocos2d::log("_____DELETE___UPDATE___FOLDER___FAILED__________");
			}
		}
	}
}

void LoadingGUI::checkUpdateJS(bool retry){
	initDownloader();

	//if (!retry) NativeBridge::logLoadStart();
	cocos2d::log("______START___UPDATE___JS______");
	isWaitingDownload = true;

	// Loading

	// Download Listener
	if (!_am->getLocalManifest()->isLoaded())
	{
	    lbUpdate->setString("Manifest Error");
		cocos2d::log("Fail to update assets, step skipped.");
		//NativeBridge::logUpdateError("lolca_manifest_load_fail");
		//skipUpdate();
		onLoadEnd(false);
	}
	else
	{
		cocos2d::log("Start download file from server.");
	    lbUpdate->setString("Updating...");
		std::string version = _am->getLocalManifest()->getVersion();
		fr::FrameworkDelegate::getInstance()->setJSVersion(version);

		//int testIndex = _testIndex;
		_amListener = cocos2d::extension::EventListenerAssetsManagerEx::create(_am, [this](EventAssetsManagerEx* event){
			static int failCount = 0;
			string eventMsg = StringUtils::format("%d_%s_%s_", event->getEventCode(),event->getAssetId().c_str(),event->getMessage().c_str());
			switch (event->getEventCode())
			{
			case EventAssetsManagerEx::EventCode::ERROR_NO_LOCAL_MANIFEST:
			{
				cocos2d::log("No local manifest file found, skip assets update.");
				//NativeBridge::logUpdateError(eventMsg.append("no_local_manifest_found"));
				//this->onLoadEnd(false);
				//skipUpdate();

        	    lbUpdate->setString("Manifest local not found");
				onLoadEnd(false);
				break;
			}
			case EventAssetsManagerEx::EventCode::UPDATE_PROGRESSION:
			{
				if (event->getAssetsManagerEx()->getTotalToDownload() > 0)
				{
					this->updateDownload(event->getAssetsManagerEx()->getTotalToDownload() - event->getAssetsManagerEx()->getTotalWaitToDownload(), event->getAssetsManagerEx()->getTotalToDownload());
				}
				break;
			}
			case EventAssetsManagerEx::EventCode::ERROR_DOWNLOAD_MANIFEST:
			case EventAssetsManagerEx::EventCode::ERROR_PARSE_MANIFEST:
			{
			    lbUpdate->setString("Manifest download error");
				cocos2d::log("Fail to download manifest file, update skipped.");
				//NativeBridge::logUpdateError(eventMsg.append("download_manifest_fail"));
				//this->onLoadEnd(false);
				//skipUpdate();
				onLoadEnd(false);
				break;
			}
			case EventAssetsManagerEx::EventCode::ALREADY_UP_TO_DATE:
			{
			    lbUpdate->setString("Update Finished");
				cocos2d::log("Update finished. %s", event->getMessage().c_str());
				this->onLoadEnd();
				break;
			}
			case EventAssetsManagerEx::EventCode::UPDATE_FINISHED:
			{
			    lbUpdate->setString("Update Finished");
				std::string version = _am->getLocalManifest()->getVersion();
				fr::FrameworkDelegate::getInstance()->setJSVersion(version);
				cocos2d::log("Update finished. %s", event->getMessage().c_str());
				this->onLoadEnd();
				break;
			}
			case EventAssetsManagerEx::EventCode::UPDATE_FAILED:
			{
				cocos2d::log("Update failed. %s", event->getMessage().c_str());

				failCount++;
				if (failCount < 5)
				{
					_am->downloadFailedAssets();
				}
				else
				{
					//NativeBridge::logUpdateError(eventMsg.append("_maximum_download_file"));

					cocos2d::log("Reach maximum fail count, exit update process");
					failCount = 0;
					this->onLoadEnd(false);
				}
				break;
			}
			case EventAssetsManagerEx::EventCode::ERROR_UPDATING:
			{
			    lbUpdate->setString("Error Update");
				cocos2d::log("Asset %s : %s", event->getAssetId().c_str(), event->getMessage().c_str());
				break;
			}
			case EventAssetsManagerEx::EventCode::ERROR_DECOMPRESS:
			{
			    lbUpdate->setString("Error Decompress");
				//NativeBridge::logUpdateError(eventMsg);
				cocos2d::log("%s", event->getMessage().c_str());
				break;
			}
			case EventAssetsManagerEx::EventCode::ERROR_LOST_CONNECTION:
			{
			    lbUpdate->setString("Lost Connection");
				failCount = 0;
				this->onLoadEnd(false);
				break;
			}
			default:
				break;
			}
		});

		Director::getInstance()->getEventDispatcher()->addEventListenerWithFixedPriority(_amListener, 1);
		_am->update();
	}
}

void LoadingGUI::checkNoNetwork() {
	cocos2d::log("____CHECK_NETWORK_____");

	bool networkstatus = NativeBridge::checkNetwork();
	if (networkstatus)
	{
		checkNewAPK();
		checkUpdateJS();
	}
	else
	{
		DialogGUI::create(this, CCLocalizedString("CHECK_NETWORK"),1, &closeGame);
	}
}

void LoadingGUI::onLoadEnd(bool success)
{
	onLoadJSVersion();

	if (_amListener != NULL)
	{
		Director::getInstance()->getEventDispatcher()->removeEventListener(_amListener);
		_amListener = NULL;
	}

	if (_am != NULL)
	{
		_am->release();
		_am = NULL;
	}

	isWaitingDownload = false;

	if (success)
	{
		this->isSkipUpdate = false;
		this->onStartGame();
	}
	else
	{
		this->isSkipUpdate = true;
		DialogGUI::create(this, "Update Failed !!!",1, CC_CALLBACK_0(LoadingGUI::retryUpdateJS, this));
	}
}

void LoadingGUI::updateDownload(int cur, int total)
{
	string message = "Updating";
    message += CCString::createWithFormat(" (%d/%d)", cur, total)->getCString();

    if (lbUpdate != nullptr)
        lbUpdate->setString(message);
}

void LoadingGUI::retryUpdateJS()
{
	checkUpdateJS(true);
}

void LoadingGUI::onStartGame()
{
	//NativeBridge::logLoadSuccess(this->isSkipUpdate);

	cocos2d::log(">>startGame");

	isFinishLoaded = true;

	updateDownload(1, 1);
	lbUpdate->setString("Update Finished");

	cocos2d::log(">>runScript");
	this->runAction(Sequence::create(DelayTime::create(0.5f), CallFunc::create(CC_CALLBACK_0(LoadingGUI::runScript, this)), NULL));
}

void LoadingGUI::onLoadJSVersion()
{
	bool versionDone = false;
	std::string str = "";

	if (_am != NULL)
	{
		if (_am->getLocalManifest() != NULL)
		{
			str = _am->getLocalManifest()->getVersion();
			versionDone = true;
		}
	}

	if (!versionDone)
	{
		str = "0";
	}

	localStorageSetItem("KEY_JS_VERSION", str);
	this->lbVersion->setString(NativeBridge::getVersionString().c_str());
	cocos2d::log("________________JS___VERSION___%s", str.c_str());
}

void LoadingGUI::skipUpdate()
{
	onLoadJSVersion();

	if (_amListener != NULL)
	{
		Director::getInstance()->getEventDispatcher()->removeEventListener(_amListener);
		_amListener = NULL;
	}

	if (_am != NULL)
	{
		_am->release();
		_am = NULL;
	}

	isWaitingDownload = false;

	this->isSkipUpdate = false;
	this->onStartGame();
}

void LoadingGUI::runScript()
{
#if (COCOS2D_DEBUG > 0) && (CC_CODE_IDE_DEBUG_SUPPORT > 0)
#else
	js_module_register();
	ScriptingCore* sc = ScriptingCore::getInstance();
	sc->start();
	sc->runScript("script/jsb_boot.js");
#if defined(COCOS2D_DEBUG) && (COCOS2D_DEBUG > 0)
	sc->enableDebugger();
#endif
	ScriptEngineProtocol *engine = ScriptingCore::getInstance();
	ScriptEngineManager::getInstance()->setScriptEngine(engine);
	ScriptingCore::getInstance()->runScript("main.js");
#endif
}