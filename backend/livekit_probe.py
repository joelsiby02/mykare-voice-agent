# import livekit.agents

# print("LiveKit Agents imported successfully")

# print("\nVersion:")
# try:
#     import importlib.metadata
#     print(importlib.metadata.version("livekit-agents"))
# except Exception as e:
#     print(e)

# print("\nAgents module:")
# print(dir(livekit.agents))



# from livekit.plugins import openai
# from livekit.plugins import deepgram
# from livekit.plugins import cartesia

# print("\nOPENAI")
# print(dir(openai))

# print("\nDEEPGRAM")
# print(dir(deepgram))

# print("\nCARTESIA")
# print(dir(cartesia))

# voice_probe.py

from livekit.agents import Agent
from livekit.agents import AgentSession
from livekit.agents import function_tool

print("Agent OK")
print("AgentSession OK")
print("function_tool OK")