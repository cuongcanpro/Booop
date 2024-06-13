#include "AppDelegate.h"
#include "SimpleAudioEngine.h"
#include "baseframework/BaseFramework.h"
#include "update/LoadingScene.h"

#if (CC_TARGET_PLATFORM != CC_PLATFORM_LINUX)
#include "ide-support/CodeIDESupport.h"
#endif

#if (COCOS2D_DEBUG > 0) && (CC_CODE_IDE_DEBUG_SUPPORT > 0)
#include "runtime/Runtime.h"
#include "ide-support/RuntimeJsImpl.h"
#else
#endif

USING_NS_CC;
using namespace CocosDenshion;

AppDelegate::AppDelegate()
{
	FileUtils::setEncryptKeyPart(0, 0x63dcaca7);
	FileUtils::setEncryptKeyPart(1, 0x8ce6a0bd);
	FileUtils::setEncryptKeyPart(2, 0x4505709a);
	FileUtils::setEncryptKeyPart(3, 0x3ac629e8);
}

AppDelegate::~AppDelegate()
{
	SimpleAudioEngine::end();
    ScriptEngineManager::destroyInstance();

#if (COCOS2D_DEBUG > 0) && (CC_CODE_IDE_DEBUG_SUPPORT > 0)
    // NOTE:Please don't remove this call if you want to debug with Cocos Code IDE
    RuntimeEngine::getInstance()->end();
#endif
}

//if you want a different context,just modify the value of glContextAttrs
//it will takes effect on all platforms
void AppDelegate::initGLContextAttrs()
{
    //set OpenGL context attributions,now can only set six attributions:
    //red,green,blue,alpha,depth,stencil
    GLContextAttrs glContextAttrs = {8, 8, 8, 8, 24, 8};

    GLView::setGLContextAttrs(glContextAttrs);
}

bool AppDelegate::applicationDidFinishLaunching()
{
	cocos2d::log("++START++");
	fr::FrameworkDelegate::getInstance()->applicationDidFinishLaunching();
	fr::FrameworkDelegate::getInstance()->setFolderAssets("zingplay");

    // initialize director
    auto director = Director::getInstance();

    // set FPS. the default value is 1.0/60 if you don't call this
    director->setAnimationInterval(1.0 / 60);
    //director->setDisplayStats(true);

	auto glview = director->getOpenGLView();
	if (!glview) {
#if(CC_TARGET_PLATFORM == CC_PLATFORM_WP8) || (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
		glview = cocos2d::GLViewImpl::create("GameClientJS");
#else
		director->setOpenGLView(glview);
#endif
	}

    Size frameSize = glview->getFrameSize();
    float ratio = frameSize.width/ frameSize.height;
    int width = 1200;
    int height = 720;
    if(ratio > 2) {
        if(CC_TARGET_PLATFORM == CC_PLATFORM_IOS) {
	        glview->setDesignResolutionSize(height * 2, height,ResolutionPolicy::SHOW_ALL);
        }
        else {
	        glview->setDesignResolutionSize(width, height,ResolutionPolicy::FIXED_HEIGHT);
        }
    }
    else if(ratio > 1.5) {
        glview->setDesignResolutionSize(width, height,ResolutionPolicy::FIXED_HEIGHT);
    }
    else {
        glview->setDesignResolutionSize(width, height,ResolutionPolicy::SHOW_ALL);
    }

	// search path
	cocos2d::log("##addSearchPath %s",fr::NativeService::getFolderUpdateAssets().c_str());
	FileUtils::getInstance()->addSearchPath(fr::NativeService::getFolderUpdateAssets(), true);
	FileUtils::getInstance()->addSearchPath(fr::NativeService::getFolderUpdateAssets() + "/res", true);
	FileUtils::getInstance()->addSearchPath(fr::NativeService::getFolderUpdateAssets() + "/res/common", true);
	FileUtils::getInstance()->addSearchPath(fr::NativeService::getFolderUpdateAssets() + "/res/Lobby", true);
	FileUtils::getInstance()->addSearchPath(fr::NativeService::getFolderUpdateAssets() + "/res/UI", true);
	FileUtils::getInstance()->addSearchPath(fr::NativeService::getFolderUpdateAssets() + "/src", true);

	FileUtils::getInstance()->addSearchPath("res");

#if (COCOS2D_DEBUG > 0) && (CC_CODE_IDE_DEBUG_SUPPORT > 0)

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    // for getIPAddress
	 extern void setActivityPathForAndroid(const std::string &path);
	 setActivityPathForAndroid("gsn/game/ZingPlayActivity");
#endif
	//add path for debug on win32
	
    auto runtimeEngine = RuntimeEngine::getInstance();
    auto jsRuntime = RuntimeJsImpl::create();
    runtimeEngine->addRuntime(jsRuntime, kRuntimeEngineJs);
    runtimeEngine->start();
    
    // js need special debug port
    if (runtimeEngine->getProjectConfig().getDebuggerType() != kCCRuntimeDebuggerNone)
    {
        jsRuntime->startWithDebugger();
    }
#else
	cocos2d::log("++START LOADING SCENE++");
	Scene *scene = Scene::create();
	scene->addChild(LoadingGUI::instance());
	director->runWithScene(scene);
#endif
    return true;
}

// This function will be called when the app is inactive. When comes a phone call,it's be invoked too
void AppDelegate::applicationDidEnterBackground()
{
	cocos2d::log("###applicationDidEnterBackground");
	
    auto director = Director::getInstance();
    director->stopAnimation();
    director->getEventDispatcher()->dispatchCustomEvent("game_on_hide");


    SimpleAudioEngine::getInstance()->pauseBackgroundMusic();
    SimpleAudioEngine::getInstance()->pauseAllEffects();
}

// this function will be called when the app is active again
void AppDelegate::applicationWillEnterForeground()
{
	cocos2d::log("###applicationDidEnterBackground");
	
    auto director = Director::getInstance();
    director->startAnimation();
    director->getEventDispatcher()->dispatchCustomEvent("game_on_show");
    SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
    SimpleAudioEngine::getInstance()->resumeAllEffects();
}