#ifndef IntroScene_h__
#define IntroScene_h__

#include "cocos2d.h"
#include "extensions/cocos-ext.h"
#include "engine/AsyncDownloader.h"
#include <stdlib.h>
#include <ctype.h>
#include "engine/Handler.h"
#include "CCLocalizedString.h"
#include "cocos/ui/CocosGUI.h"
#include "SimpleAudioEngine.h"

USING_NS_CC;
USING_NS_CC_EXT;

#include <string>
#include <vector>

using namespace std;
using namespace ui;

class LoadingGUI : public Layer
{
private:
	static LoadingGUI *_inst;

public:
	AssetsManagerEx* _am;
	EventListenerAssetsManagerEx* _amListener;

	Text *lbUpdate;
	Text *lbVersion;

	bool isFinishLoaded;
	bool isWaitingDownload;
	bool isSkipUpdate;

	LoadingGUI() : Layer()
	{
		isFinishLoaded = false;
		isWaitingDownload = false;
		isSkipUpdate = false;

		initUI();
	}

	void initUI();
	void initDownloader();
	void checkNewAPK();

	void retryUpdateJS();
	void checkUpdateJS(bool retry = false);
	void checkNoNetwork();

	void updateDownload(int cur, int total);

	void onLoadEnd(bool success = true);
	void skipUpdate();
	void onStartGame();
	void runScript();

	void onLoadJSVersion();

	static LoadingGUI *instance()
	{
		if (_inst == NULL)
		{
			_inst = new LoadingGUI();
		}

		return _inst;
	}
};

#endif // IntroScene_h__

